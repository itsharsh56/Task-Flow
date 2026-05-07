/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { TaskPriority } from '../../common/enums/task-priority.enum';
import { TaskStatus } from '../../common/enums/task-status.enum';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ProjectMember } from '../projects/entities/project-member.entity';
import { Project } from '../projects/entities/project.entity';
import { UsersService } from '../users/users.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { Task } from './entities/task.entity';
import { UserRole } from 'src/common/enums/user-roles.enum';
import { NotificationsService } from '../notifications/notifications.service';


@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private readonly projectMembersRepository: Repository<ProjectMember>,
    private readonly usersService: UsersService,
    private readonly activityLogsService: ActivityLogsService,
    private readonly notificationsService: NotificationsService,
  ) { }

  async create(createTaskDto: CreateTaskDto, currentUser: AuthUser) {
    const project = await this.projectsRepository.findOne({
      where: { id: createTaskDto.projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (createTaskDto.assignedToId) {
      await this.usersService.findById(createTaskDto.assignedToId);
      await this.ensureProjectMember(project.id, createTaskDto.assignedToId);
    }

    const task = this.tasksRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      projectId: createTaskDto.projectId,
      createdById: currentUser.sub,
      assignedToId: createTaskDto.assignedToId ?? null,
      priority: createTaskDto.priority ?? TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
    });

    const savedTask = await this.tasksRepository.save(task);

    await this.activityLogsService.create({
      action: `Created task ${savedTask.title}`,
      performedById: currentUser.sub,
      projectId: savedTask.projectId,
      taskId: savedTask.id,
    });

    if (savedTask.assignedToId) {
      const assignee = await this.usersService.findById(savedTask.assignedToId);

      await this.activityLogsService.create({
        action: `Assigned task ${savedTask.title} to ${assignee.name}`,
        performedById: currentUser.sub,
        projectId: savedTask.projectId,
        taskId: savedTask.id,
      });
    }

    if (savedTask.assignedToId && savedTask.assignedToId !== currentUser.sub) {
      await this.notificationsService.create(
        savedTask.assignedToId,
        `You were assigned to task ${savedTask.title}`,
      );
    }


    const fullTask = await this.getTaskWithRelations(savedTask.id);

    return {
      success: true,
      message: 'Task created successfully',
      data: this.toTaskResponse(fullTask),
    };
  }

  async findAll(queryDto: QueryTasksDto, currentUser: AuthUser) {
    const page = queryDto.page ?? 1;
    const limit = queryDto.limit ?? 10;

    const query = this.buildVisibleTasksQuery(currentUser);

    if (queryDto.projectId) {
      query.andWhere('task.projectId = :projectId', {
        projectId: queryDto.projectId,
      });
    }

    if (queryDto.assignedToId) {
      query.andWhere('task.assignedToId = :assignedToId', {
        assignedToId: queryDto.assignedToId,
      });
    }

    if (queryDto.status) {
      query.andWhere('task.status = :status', { status: queryDto.status });
    }

    if (queryDto.priority) {
      query.andWhere('task.priority = :priority', {
        priority: queryDto.priority,
      });
    }

    if (queryDto.search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('task.title LIKE :search', {
            search: `%${queryDto.search}%`,
          }).orWhere('task.description LIKE :search', {
            search: `%${queryDto.search}%`,
          });
        }),
      );
    }

    if (queryDto.overdue) {
      query
        .andWhere('task.dueDate IS NOT NULL')
        .andWhere('task.dueDate < :now', { now: new Date() })
        .andWhere('task.status != :doneStatus', {
          doneStatus: TaskStatus.DONE,
        });
    }

    const sortFieldMap = {
      createdAt: 'task.createdAt',
      dueDate: 'task.dueDate',
      title: 'task.title',
    } as const;

    const sortBy = queryDto.sortBy ?? 'createdAt';
    const sortOrder = (queryDto.sortOrder ?? 'DESC').toUpperCase() as
      | 'ASC'
      | 'DESC';

    query
      .orderBy(sortFieldMap[sortBy], sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [tasks, total] = await query.getManyAndCount();

    return {
      success: true,
      message: 'Tasks fetched successfully',
      data: {
        items: tasks.map((task) => this.toTaskResponse(task)),
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async findOne(taskId: number, currentUser: AuthUser) {
    const task = await this.buildVisibleTasksQuery(currentUser)
      .where('task.id = :taskId', { taskId })
      .getOne();

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return {
      success: true,
      message: 'Task fetched successfully',
      data: this.toTaskResponse(task),
    };
  }

  async update(
    taskId: number,
    updateTaskDto: UpdateTaskDto,
    currentUser: AuthUser,
  ) {
    const task = await this.getTaskWithRelations(taskId);

    const previousAssignedToId = task.assignedToId;

    if (updateTaskDto.assignedToId !== undefined) {
      await this.usersService.findById(updateTaskDto.assignedToId);
      await this.ensureProjectMember(
        task.projectId,
        updateTaskDto.assignedToId,
      );
      task.assignedToId = updateTaskDto.assignedToId;
    }

    if (updateTaskDto.title !== undefined) {
      task.title = updateTaskDto.title;
    }

    if (updateTaskDto.description !== undefined) {
      task.description = updateTaskDto.description;
    }

    if (updateTaskDto.priority !== undefined) {
      task.priority = updateTaskDto.priority;
    }

    if (updateTaskDto.dueDate !== undefined) {
      task.dueDate = new Date(updateTaskDto.dueDate);
    }

    await this.tasksRepository.save(task);

    await this.activityLogsService.create({
      action: `Updated task ${task.title}`,
      performedById: currentUser.sub,
      projectId: task.projectId,
      taskId: task.id,
    });

    if (
      updateTaskDto.assignedToId !== undefined &&
      updateTaskDto.assignedToId !== previousAssignedToId
    ) {
      const assignee = await this.usersService.findById(updateTaskDto.assignedToId);

      await this.activityLogsService.create({
        action: `Assigned task ${task.title} to ${assignee.name}`,
        performedById: currentUser.sub,
        projectId: task.projectId,
        taskId: task.id,
      });

      if (updateTaskDto.assignedToId !== currentUser.sub) {
        await this.notificationsService.create(
          updateTaskDto.assignedToId,
          `You were assigned to task ${task.title}`,
        );
      }
    } else if (task.assignedToId && task.assignedToId !== currentUser.sub) {
      await this.notificationsService.create(
        task.assignedToId,
        `Task ${task.title} was updated`,
      );
    }

    const updatedTask = await this.getTaskWithRelations(taskId);

    return {
      success: true,
      message: 'Task updated successfully',
      data: this.toTaskResponse(updatedTask),
    };
  }

  async updateStatus(
    taskId: number,
    updateTaskStatusDto: UpdateTaskStatusDto,
    currentUser: AuthUser,
  ) {
    const task = await this.getTaskWithRelations(taskId);

    if (
      currentUser.role !== UserRole.ADMIN &&
      task.assignedToId !== currentUser.sub
    ) {
      throw new ForbiddenException('You can only update tasks assigned to you');
    }

    task.status = updateTaskStatusDto.status;
    await this.tasksRepository.save(task);

    await this.activityLogsService.create({
      action: `Moved task ${task.title} to ${updateTaskStatusDto.status}`,
      performedById: currentUser.sub,
      projectId: task.projectId,
      taskId: task.id,
    });

    if (task.createdById !== currentUser.sub) {
      await this.notificationsService.create(
        task.createdById,
        `Task ${task.title} moved to ${updateTaskStatusDto.status}`,
      );
    }


    const updatedTask = await this.getTaskWithRelations(taskId);

    return {
      success: true,
      message: 'Task status updated successfully',
      data: this.toTaskResponse(updatedTask),
    };
  }

  async remove(taskId: number, currentUser: AuthUser) {
    const task = await this.getTaskWithRelations(taskId);

    await this.tasksRepository.softDelete(taskId);

    await this.activityLogsService.create({
      action: `Deleted task ${task.title}`,
      performedById: currentUser.sub,
      projectId: task.projectId,
      taskId: task.id,
    });

    return {
      success: true,
      message: 'Task deleted successfully',
      data: null,
    };
  }

  private buildVisibleTasksQuery(currentUser: AuthUser) {
    const query = this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .leftJoinAndSelect('task.createdBy', 'createdBy');

    if (currentUser.role !== UserRole.ADMIN) {
      query.innerJoin(
        'project.members',
        'projectMember',
        'projectMember.userId = :userId',
        { userId: currentUser.sub },
      );
    }

    return query;
  }

  private async getTaskWithRelations(taskId: number) {
    const task = await this.tasksRepository.findOne({
      where: { id: taskId },
      relations: {
        project: true,
        assignedTo: true,
        createdBy: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  private async ensureProjectMember(projectId: number, userId: number) {
    const membership = await this.projectMembersRepository.findOne({
      where: { projectId, userId },
    });

    if (!membership) {
      throw new BadRequestException(
        'Assigned user must already be a member of the project',
      );
    }
  }

  private toTaskResponse(task: Task) {
    return {
      ...task,
      isOverdue:
        !!task.dueDate &&
        task.status !== TaskStatus.DONE &&
        new Date(task.dueDate).getTime() < Date.now(),
    };
  }

}

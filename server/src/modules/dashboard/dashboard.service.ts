import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskStatus } from '../../common/enums/task-status.enum';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { ActivityLog } from '../activity-logs/entities/activity-log.entity';
import { ProjectMember } from '../projects/entities/project-member.entity';
import { Project } from '../projects/entities/project.entity';
import { Task } from '../tasks/entities/task.entity';
import { UserRole } from 'src/common/enums/user-roles.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private readonly projectMembersRepository: Repository<ProjectMember>,
    @InjectRepository(ActivityLog)
    private readonly activityLogsRepository: Repository<ActivityLog>,
  ) {}

  async getStats(currentUser: AuthUser) {
    const totalTasks = await this.visibleTasksQuery(currentUser).getCount();

    const completedTasks = await this.visibleTasksQuery(currentUser)
      .andWhere('task.status = :doneStatus', { doneStatus: TaskStatus.DONE })
      .getCount();

    const pendingTasks = await this.visibleTasksQuery(currentUser)
      .andWhere('task.status != :doneStatus', { doneStatus: TaskStatus.DONE })
      .getCount();

    const overdueTasks = await this.visibleTasksQuery(currentUser)
      .andWhere('task.dueDate IS NOT NULL')
      .andWhere('task.dueDate < :now', { now: new Date() })
      .andWhere('task.status != :doneStatus', { doneStatus: TaskStatus.DONE })
      .getCount();

    const totalProjects =
      currentUser.role === UserRole.ADMIN
        ? await this.projectsRepository.count()
        : await this.projectMembersRepository.count({
            where: { userId: currentUser.sub },
          });

    const statusAnalyticsRaw = await this.visibleTasksQuery(currentUser)
      .select('task.status', 'status')
      .addSelect('COUNT(task.id)', 'count')
      .groupBy('task.status')
      .getRawMany<{ status: string; count: string }>();

    const priorityAnalyticsRaw = await this.visibleTasksQuery(currentUser)
      .select('task.priority', 'priority')
      .addSelect('COUNT(task.id)', 'count')
      .groupBy('task.priority')
      .getRawMany<{ priority: string; count: string }>();

    const recentActivity = await this.visibleActivityQuery(currentUser)
      .orderBy('activity.createdAt', 'DESC')
      .take(8)
      .getMany();

    const upcomingDeadlines = await this.visibleTasksQuery(currentUser)
      .andWhere('task.dueDate IS NOT NULL')
      .andWhere('task.dueDate >= :now', { now: new Date() })
      .andWhere('task.status != :doneStatus', { doneStatus: TaskStatus.DONE })
      .orderBy('task.dueDate', 'ASC')
      .take(5)
      .getMany();

    const assignedTasks = await this.visibleTasksQuery(currentUser)
      .andWhere('task.assignedToId = :userId', { userId: currentUser.sub })
      .andWhere('task.status != :doneStatus', { doneStatus: TaskStatus.DONE })
      .orderBy('task.dueDate', 'ASC')
      .take(5)
      .getMany();

    return {
      success: true,
      message: 'Dashboard stats fetched successfully',
      data: {
        stats: {
          totalTasks,
          completedTasks,
          pendingTasks,
          overdueTasks,
          totalProjects,
          completionPercentage:
            totalTasks === 0
              ? 0
              : Number(((completedTasks / totalTasks) * 100).toFixed(2)),
        },
        statusAnalytics: statusAnalyticsRaw.map((item) => ({
          status: item.status,
          count: Number(item.count),
        })),
        priorityAnalytics: priorityAnalyticsRaw.map((item) => ({
          priority: item.priority,
          count: Number(item.count),
        })),
        recentActivity,
        upcomingDeadlines: upcomingDeadlines.map((task) =>
          this.toTaskSummary(task),
        ),
        assignedTasks: assignedTasks.map((task) => this.toTaskSummary(task)),
      },
    };
  }

  private visibleTasksQuery(currentUser: AuthUser) {
    const query = this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.project', 'project')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .leftJoinAndSelect('task.createdBy', 'createdBy');

    if (currentUser.role !== UserRole.ADMIN) {
      query.innerJoin(
        ProjectMember,
        'projectMember',
        'projectMember.projectId = task.projectId AND projectMember.userId = :userId',
        { userId: currentUser.sub },
      );
    }

    return query;
  }

  private visibleActivityQuery(currentUser: AuthUser) {
    const query = this.activityLogsRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.performedBy', 'performedBy')
      .leftJoinAndSelect('activity.project', 'project')
      .leftJoinAndSelect('activity.task', 'task');

    if (currentUser.role !== UserRole.ADMIN) {
      query.innerJoin(
        ProjectMember,
        'projectMember',
        'projectMember.projectId = activity.projectId AND projectMember.userId = :userId',
        { userId: currentUser.sub },
      );
    }

    return query;
  }

  private toTaskSummary(task: Task) {
    return {
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      projectId: task.projectId,
      assignedTo: task.assignedTo,
      isOverdue:
        !!task.dueDate &&
        task.status !== TaskStatus.DONE &&
        new Date(task.dueDate).getTime() < Date.now(),
    };
  }
}

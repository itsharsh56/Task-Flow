import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ProjectMember } from '../projects/entities/project-member.entity';
import { Task } from '../tasks/entities/task.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';
import { UserRole } from 'src/common/enums/user-roles.enum';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    @InjectRepository(ProjectMember)
    private readonly projectMembersRepository: Repository<ProjectMember>,
    private readonly activityLogsService: ActivityLogsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createCommentDto: CreateCommentDto, currentUser: AuthUser) {
    const task = await this.ensureTaskVisible(
      createCommentDto.taskId,
      currentUser,
    );

    const comment = this.commentsRepository.create({
      taskId: task.id,
      userId: currentUser.sub,
      message: createCommentDto.message,
    });

    const savedComment = await this.commentsRepository.save(comment);

    await this.activityLogsService.create({
      action: `Commented on task ${task.title}`,
      performedById: currentUser.sub,
      projectId: task.projectId,
      taskId: task.id,
    });

    const recipients = [task.assignedToId, task.createdById].filter(
      (id): id is number => Boolean(id) && id !== currentUser.sub,
    );

    await this.notificationsService.createMany(
      recipients,
      `New comment on task ${task.title}`,
    );

    const fullComment = await this.commentsRepository.findOne({
      where: { id: savedComment.id },
      relations: {
        user: true,
      },
    });

    return {
      success: true,
      message: 'Comment created successfully',
      data: fullComment,
    };
  }

  async findByTaskId(taskId: number, currentUser: AuthUser) {
    await this.ensureTaskVisible(taskId, currentUser);

    const comments = await this.commentsRepository.find({
      where: { taskId },
      relations: {
        user: true,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    return {
      success: true,
      message: 'Comments fetched successfully',
      data: comments,
    };
  }

  private async ensureTaskVisible(taskId: number, currentUser: AuthUser) {
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

    if (currentUser.role !== UserRole.ADMIN) {
      const membership = await this.projectMembersRepository.findOne({
        where: {
          projectId: task.projectId,
          userId: currentUser.sub,
        },
      });

      if (!membership) {
        throw new ForbiddenException('You do not have access to this task');
      }
    }

    return task;
  }
}

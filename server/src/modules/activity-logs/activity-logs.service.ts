import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { ProjectMember } from '../projects/entities/project-member.entity';
import { QueryActivityLogsDto } from './dto/query-activity-logs.dto';
import { ActivityLog } from './entities/activity-log.entity';
import { UserRole } from 'src/common/enums/user-roles.enum';

type CreateActivityLogInput = {
  action: string;
  performedById: number;
  projectId?: number | null;
  taskId?: number | null;
};

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogsRepository: Repository<ActivityLog>,
    @InjectRepository(ProjectMember)
    private readonly projectMembersRepository: Repository<ProjectMember>,
  ) {}

  async create(input: CreateActivityLogInput) {
    const activityLog = this.activityLogsRepository.create({
      action: input.action,
      performedById: input.performedById,
      projectId: input.projectId ?? null,
      taskId: input.taskId ?? null,
    });

    return this.activityLogsRepository.save(activityLog);
  }

  async getProjectActivity(
    projectId: number,
    queryDto: QueryActivityLogsDto,
    currentUser: AuthUser,
  ) {
    if (currentUser.role !== UserRole.ADMIN) {
      const membership = await this.projectMembersRepository.findOne({
        where: {
          projectId,
          userId: currentUser.sub,
        },
      });

      if (!membership) {
        throw new ForbiddenException(
          'You do not have access to this project activity',
        );
      }
    }

    const page = queryDto.page ?? 1;
    const limit = queryDto.limit ?? 10;

    const [items, total] = await this.activityLogsRepository.findAndCount({
      where: { projectId },
      relations: {
        performedBy: true,
        task: true,
        project: true,
      },
      order: {
        createdAt: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      success: true,
      message: 'Project activity fetched successfully',
      data: {
        items,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }
}

import { ConfigService } from '@nestjs/config';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { User } from '../modules/users/entities/user.entity';
import { Project } from '../modules/projects/entities/project.entity';
import { ProjectMember } from '../modules/projects/entities/project-member.entity';
import { Task } from '../modules/tasks/entities/task.entity';
import { Comment } from '../modules/comments/entities/comment.entity';
import { Notification } from '../modules/notifications/entities/notification.entity';
import { ActivityLog } from '../modules/activity-logs/entities/activity-log.entity';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
    type: 'mysql',
    url: configService.getOrThrow<string>('DATABASE_URL'),
    entities: [
      User,
      Project,
      ProjectMember,
      Task,
      Comment,
      Notification,
      ActivityLog,
    ],
    synchronize: configService.get<string>('DB_SYNC', 'false') === 'true',
    logging:
      configService.get<string>('NODE_ENV', 'development') !== 'production',
  }),
};

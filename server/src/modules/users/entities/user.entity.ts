import { Column, Entity, OneToMany } from 'typeorm';
import { CoreEntity } from '../../../shared/entities/core.entity';
import { ActivityLog } from '../../activity-logs/entities/activity-log.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { ProjectMember } from '../../projects/entities/project-member.entity';
import { Project } from '../../projects/entities/project.entity';
import { Task } from '../../tasks/entities/task.entity';
import { UserRole } from 'src/common/enums/user-roles.enum';

@Entity('users')
export class User extends CoreEntity {
  @Column({ length: 120 })
  name!: string;

  @Column({ unique: true, length: 160 })
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.MEMBER })
  role!: UserRole;

  @OneToMany(() => Project, (project) => project.createdBy)
  createdProjects!: Project[];

  @OneToMany(() => ProjectMember, (projectMember) => projectMember.user)
  projectMemberships!: ProjectMember[];

  @OneToMany(() => Task, (task) => task.assignedTo)
  assignedTasks!: Task[];

  @OneToMany(() => Task, (task) => task.createdBy)
  createdTasks!: Task[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments!: Comment[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications!: Notification[];

  @OneToMany(() => ActivityLog, (activityLog) => activityLog.performedBy)
  activityLogs!: ActivityLog[];
}

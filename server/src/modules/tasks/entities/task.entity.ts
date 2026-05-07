import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { TaskPriority } from '../../../common/enums/task-priority.enum';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { CoreEntity } from '../../../shared/entities/core.entity';
import { ActivityLog } from '../../activity-logs/entities/activity-log.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Project } from '../../projects/entities/project.entity';
import { User } from '../../users/entities/user.entity';

@Entity('tasks')
@Index(['projectId', 'status'])
@Index(['assignedToId', 'dueDate'])
export class Task extends CoreEntity {
  @Column({ length: 150 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO })
  status!: TaskStatus;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority!: TaskPriority;

  @Column({ type: 'datetime', nullable: true })
  dueDate!: Date | null;

  @Column({ type: 'int', nullable: true })
  assignedToId!: number | null;

  @Column({ type: 'int' })
  projectId!: number;

  @Column({ type: 'int' })
  createdById!: number;

  @ManyToOne(() => User, (user) => user.assignedTasks, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo!: User | null;

  @ManyToOne(() => Project, (project) => project.tasks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId' })
  project!: Project;

  @ManyToOne(() => User, (user) => user.createdTasks, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'createdById' })
  createdBy!: User;

  @OneToMany(() => Comment, (comment) => comment.task)
  comments!: Comment[];

  @OneToMany(() => ActivityLog, (activityLog) => activityLog.task)
  activityLogs!: ActivityLog[];

  @DeleteDateColumn()
  deletedAt?: Date | null;
}

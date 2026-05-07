/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CoreEntity } from '../../../shared/entities/core.entity';
import { Project } from '../../projects/entities/project.entity';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/entities/user.entity';

@Entity('activity_logs')
export class ActivityLog extends CoreEntity {
  @Column({ type: 'text' })
  action!: string;

  @Column({ type: 'int' })
  performedById!: number;

  @Column({ type: 'int', nullable: true })
  projectId!: number | null;

  @Column({ type: 'int', nullable: true })
  taskId!: number | null;

  @ManyToOne(() => User, (user) => user.activityLogs, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'performedById' })
  performedBy!: User;

  @ManyToOne(() => Project, (project) => project.activityLogs, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'projectId' })
  project!: Project | null;

  @ManyToOne(() => Task, (task) => task.activityLogs, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'taskId' })
  task!: Task | null;
}

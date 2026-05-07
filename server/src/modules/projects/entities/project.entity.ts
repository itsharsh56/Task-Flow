import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { CoreEntity } from '../../../shared/entities/core.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { ProjectMember } from './project-member.entity';
import { Task } from 'src/modules/tasks/entities/task.entity';
import { ActivityLog } from 'src/modules/activity-logs/entities/activity-log.entity';

@Entity('projects')
export class Project extends CoreEntity {
  @Column({ length: 150 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'int' })
  createdById!: number;

  @ManyToOne(() => User, (user) => user.createdProjects, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'createdById' })
  createdBy!: User;

  @OneToMany(() => ProjectMember, (projectMember) => projectMember.project)
  members!: ProjectMember[];

  @OneToMany(() => Task, (task) => task.project)
  tasks!: Task[];

  @OneToMany(() => ActivityLog, (activityLog) => activityLog.project)
  activityLogs!: ActivityLog[];

  @DeleteDateColumn()
  deletedAt?: Date | null;
}

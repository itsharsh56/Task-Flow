/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { ProjectMemberRole } from '../../../common/enums/project-member-role.enum';
import { CoreEntity } from '../../../shared/entities/core.entity';
import { User } from '../../users/entities/user.entity';
import { Project } from './project.entity';

@Entity('project_members')
@Unique(['projectId', 'userId'])
export class ProjectMember extends CoreEntity {
  @Column({ type: 'int' })
  projectId!: number;

  @Column({ type: 'int' })
  userId!: number;

  @Column({
    type: 'enum',
    enum: ProjectMemberRole,
    default: ProjectMemberRole.MEMBER,
  })
  role!: ProjectMemberRole;

  @ManyToOne(() => Project, (project) => project.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId' })
  project!: Project;

  @ManyToOne(() => User, (user) => user.projectMemberships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;
}

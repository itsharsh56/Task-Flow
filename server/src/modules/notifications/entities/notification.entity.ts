import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CoreEntity } from '../../../shared/entities/core.entity';
import { User } from '../../users/entities/user.entity';

@Entity('notifications')
export class Notification extends CoreEntity {
  @Column({ type: 'int' })
  userId!: number;

  @Column({ type: 'text' })
  message!: string;

  @Column({ default: false })
  isRead!: boolean;

  @ManyToOne(() => User, (user) => user.notifications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;
}

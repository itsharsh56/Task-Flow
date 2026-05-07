/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  async create(userId: number, message: string) {
    const notification = this.notificationsRepository.create({
      userId,
      message,
    });

    return this.notificationsRepository.save(notification);
  }

  async createMany(userIds: number[], message: string) {
    const uniqueUserIds = [...new Set(userIds)].filter(
      (id): id is number => Boolean(id),
    );

    if (uniqueUserIds.length === 0) {
      return [];
    }

    const notifications = uniqueUserIds.map((userId) =>
      this.notificationsRepository.create({
        userId,
        message,
      }),
    );

    return this.notificationsRepository.save(notifications);
  }

  async findAll(queryDto: QueryNotificationsDto, currentUser: AuthUser) {
    const page = queryDto.page ?? 1;
    const limit = queryDto.limit ?? 10;

    const query = this.notificationsRepository.createQueryBuilder('notification');

    query.where('notification.userId = :userId', { userId: currentUser.sub });

    if (queryDto.isRead !== undefined) {
      query.andWhere('notification.isRead = :isRead', {
        isRead: queryDto.isRead,
      });
    }

    query
      .orderBy('notification.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await query.getManyAndCount();

    return {
      success: true,
      message: 'Notifications fetched successfully',
      data: {
        items,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          unreadCount: await this.notificationsRepository.count({
            where: {
              userId: currentUser.sub,
              isRead: false,
            },
          }),
        },
      },
    };
  }

  async markAsRead(id: number, currentUser: AuthUser) {
    const notification = await this.notificationsRepository.findOne({
      where: {
        id,
        userId: currentUser.sub,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    await this.notificationsRepository.save(notification);

    return {
      success: true,
      message: 'Notification marked as read',
      data: notification,
    };
  }

  async markAllAsRead(currentUser: AuthUser) {
    await this.notificationsRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true })
      .where('userId = :userId', { userId: currentUser.sub })
      .andWhere('isRead = :isRead', { isRead: false })
      .execute();

    return {
      success: true,
      message: 'All notifications marked as read',
      data: null,
    };
  }
}

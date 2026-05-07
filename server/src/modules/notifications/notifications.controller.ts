import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthUser } from '../../common/interfaces/auth-user.interface';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Query() queryDto: QueryNotificationsDto, @GetUser() user: AuthUser) {
    return this.notificationsService.findAll(queryDto, user);
  }

  @Patch('read-all')
  markAllAsRead(@GetUser() user: AuthUser) {
    return this.notificationsService.markAllAsRead(user);
  }

  @Patch(':id/read')
  markAsRead(@Param('id', ParseIntPipe) id: number, @GetUser() user: AuthUser) {
    return this.notificationsService.markAsRead(id, user);
  }
}

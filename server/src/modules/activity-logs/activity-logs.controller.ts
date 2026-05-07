import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthUser } from '../../common/interfaces/auth-user.interface';
import { QueryActivityLogsDto } from './dto/query-activity-logs.dto';
import { ActivityLogsService } from './activity-logs.service';

@Controller('activity-logs')
@UseGuards(JwtAuthGuard)
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get('project/:projectId')
  getProjectActivity(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query() queryDto: QueryActivityLogsDto,
    @GetUser() user: AuthUser,
  ) {
    return this.activityLogsService.getProjectActivity(
      projectId,
      queryDto,
      user,
    );
  }
}

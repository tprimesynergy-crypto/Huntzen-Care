import { Controller, Get, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get('preferences')
  async getPreferences(@Request() req: { user: { id: string } }) {
    return this.notificationsService.getPreferences(req.user.id);
  }

  @Patch('preferences')
  async updatePreferences(
    @Request() req: { user: { id: string } },
    @Body() body: { notificationsEnabled?: boolean; sessionReminderEnabled?: boolean; newArticlesEnabled?: boolean },
  ) {
    return this.notificationsService.updatePreferences(req.user.id, body);
  }

  @Get()
  async findAll(@Request() req: { user: { id: string } }) {
    return this.notificationsService.findAll(req.user.id);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: { user: { id: string } }) {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { count };
  }

  @Patch(':id/read')
  async markRead(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.notificationsService.markRead(req.user.id, id);
  }
}

import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

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

import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get('conversations')
  async getConversations(@Request() req: { user: { id: string; role: string } }) {
    return this.messagesService.getConversations(req.user.id, req.user.role);
  }

  @Get('consultations/:id')
  async getByConsultation(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.messagesService.getByConsultation(id, req.user.id);
  }

  @Post()
  async send(
    @Request() req: { user: { id: string } },
    @Body() body: { consultationId: string; content: string },
  ) {
    return this.messagesService.send(body.consultationId, req.user.id, body.content);
  }
}

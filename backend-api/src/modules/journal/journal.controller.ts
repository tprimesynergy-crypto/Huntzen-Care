import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JournalService } from './journal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Mood } from '@prisma/client';

@Controller('journal')
@UseGuards(JwtAuthGuard)
export class JournalController {
  constructor(private journalService: JournalService) {}

  @Get()
  async findAll(@Request() req: { user: { id: string } }) {
    return this.journalService.findAll(req.user.id);
  }

  @Get('stats')
  async getStats(@Request() req: { user: { id: string } }) {
    return this.journalService.getStats(req.user.id);
  }

  @Post()
  async create(
    @Request() req: { user: { id: string } },
    @Body() body: { content: string; mood?: Mood; tags?: string[] },
  ) {
    return this.journalService.create(req.user.id, body);
  }

  @Delete(':id')
  async delete(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.journalService.delete(req.user.id, id);
  }
}

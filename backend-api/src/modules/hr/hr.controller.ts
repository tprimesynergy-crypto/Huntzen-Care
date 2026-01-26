import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HRService } from './hr.service';

@Controller('hr')
@UseGuards(JwtAuthGuard)
export class HRController {
  constructor(private hrService: HRService) {}

  @Get('stats')
  async getStats(@Request() req: { user: { id: string } }) {
    return this.hrService.getStats(req.user.id);
  }
}

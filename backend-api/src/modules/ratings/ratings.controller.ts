import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RatingsService } from './ratings.service';

@Controller('ratings')
@UseGuards(JwtAuthGuard)
export class RatingsController {
  constructor(private ratingsService: RatingsService) {}

  @Post()
  async create(
    @Request() req: { user: { id: string; role: string } },
    @Body() body: { consultationId: string; rating: number; comment?: string },
  ) {
    return this.ratingsService.create(
      req.user.id,
      body.consultationId,
      body.rating,
      body.comment,
    );
  }

  @Get('me')
  async getMyRatings(@Request() req: { user: { id: string; role: string } }) {
    return this.ratingsService.getMyRatings(req.user.id, req.user.role);
  }

  @Get('stats')
  async getStats(@Request() req: { user: { id: string; role: string } }) {
    return this.ratingsService.getStats(req.user.id, req.user.role);
  }

  @Get('consultation/:consultationId')
  async getByConsultation(
    @Request() req: { user: { id: string } },
    @Param('consultationId') consultationId: string,
  ) {
    return this.ratingsService.getRatingsByConsultation(consultationId, req.user.id);
  }
}

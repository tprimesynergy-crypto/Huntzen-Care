import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { RescheduleConsultationDto } from './dto/reschedule-consultation.dto';

@Controller('consultations')
@UseGuards(JwtAuthGuard)
export class ConsultationsController {
  constructor(private consultationsService: ConsultationsService) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateConsultationDto) {
    return this.consultationsService.create(req.user.id, dto);
  }

  @Get()
  async findAll(@Request() req) {
    return this.consultationsService.findAll(
      req.user.id,
      req.user.role,
      req.user.companyId,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.consultationsService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id/cancel')
  async cancel(@Param('id') id: string, @Request() req) {
    return this.consultationsService.cancel(id, req.user.id, req.user.role);
  }

  @Patch(':id/reschedule')
  async reschedule(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: RescheduleConsultationDto,
  ) {
    return this.consultationsService.reschedule(
      id,
      req.user.id,
      req.user.role,
      dto,
    );
  }
}

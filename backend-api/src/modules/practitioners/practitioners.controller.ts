import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { PractitionersService } from './practitioners.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('practitioners')
export class PractitionersController {
  constructor(private practitionersService: PractitionersService) {}

  @Get()
  async findAll() {
    return this.practitionersService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req: { user: { id: string } }) {
    return this.practitionersService.findMeByUserId(req.user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(
    @Request() req: { user: { id: string } },
    @Body()
    body: {
      firstName?: string;
      lastName?: string;
      title?: string;
      professionalId?: string | null;
      specialty?: string;
      customSpecialty?: string | null;
      subSpecialties?: string[];
      languages?: string[];
      bio?: string;
      experience?: number | null;
      education?: string | null;
      avatarUrl?: string | null;
      coverUrl?: string | null;
      offersVideo?: boolean;
      offersPhone?: boolean;
      defaultDuration?: number;
      timezone?: string;
      isActive?: boolean;
      isAcceptingNewClients?: boolean;
      companyId?: string | null;
    },
  ) {
    return this.practitionersService.updateMe(req.user.id, body as any);
  }

  @Get('me/availability')
  @UseGuards(JwtAuthGuard)
  async getMyAvailability(@Request() req: { user: { id: string } }) {
    return this.practitionersService.getMyAvailability(req.user.id);
  }

  @Post('me/availability')
  @UseGuards(JwtAuthGuard)
  async createMyAvailability(
    @Request() req: { user: { id: string } },
    @Body()
    body: {
      type?: 'RECURRING' | 'EXCEPTION';
      dayOfWeek?: number | null;
      startTime?: string | null;
      endTime?: string | null;
      date?: string | null;
      isAvailable?: boolean;
      slotDuration?: number;
    },
  ) {
    const data = { ...body, date: body.date ? new Date(body.date) : null };
    return this.practitionersService.createMyAvailability(req.user.id, data as any);
  }

  @Patch('me/availability/:availabilityId')
  @UseGuards(JwtAuthGuard)
  async updateMyAvailability(
    @Request() req: { user: { id: string } },
    @Param('availabilityId') availabilityId: string,
    @Body()
    body: {
      type?: 'RECURRING' | 'EXCEPTION';
      dayOfWeek?: number | null;
      startTime?: string | null;
      endTime?: string | null;
      date?: string | null;
      isAvailable?: boolean;
      slotDuration?: number;
      isActive?: boolean;
    },
  ) {
    const data = { ...body, date: body.date ? new Date(body.date) : undefined };
    return this.practitionersService.updateMyAvailability(req.user.id, availabilityId, data as any);
  }

  @Delete('me/availability/:availabilityId')
  @UseGuards(JwtAuthGuard)
  async deleteMyAvailability(
    @Request() req: { user: { id: string } },
    @Param('availabilityId') availabilityId: string,
  ) {
    return this.practitionersService.deleteMyAvailability(req.user.id, availabilityId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.practitionersService.findOne(id);
  }

  @Get(':id/availability')
  async getAvailability(@Param('id') id: string) {
    return this.practitionersService.getAvailability(id);
  }
}

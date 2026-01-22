import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
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

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.practitionersService.findOne(id);
  }

  @Get(':id/availability')
  async getAvailability(@Param('id') id: string) {
    return this.practitionersService.getAvailability(id);
  }
}

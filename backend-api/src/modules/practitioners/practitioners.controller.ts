import { Controller, Get, Param } from '@nestjs/common';
import { PractitionersService } from './practitioners.service';

@Controller('practitioners')
export class PractitionersController {
  constructor(private practitionersService: PractitionersService) {}

  @Get()
  async findAll() {
    return this.practitionersService.findAll();
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

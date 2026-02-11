import { Controller, Get } from '@nestjs/common';
import { EmergencyService } from './emergency.service';

@Controller('emergency')
export class EmergencyController {
  constructor(private emergencyService: EmergencyService) {}

  @Get()
  async getPublic() {
    return this.emergencyService.getPublic();
  }
}

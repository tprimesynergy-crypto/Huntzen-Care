import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmergencyService } from './emergency.service';

@Controller('admin/emergency')
@UseGuards(JwtAuthGuard)
export class AdminEmergencyController {
  constructor(private emergencyService: EmergencyService) {}

  @Get('contacts')
  async getContacts(@Request() req: { user: { id: string } }) {
    return this.emergencyService.getContacts(req.user.id);
  }

  @Post('contacts')
  async createContact(
    @Request() req: { user: { id: string } },
    @Body() body: { name: string; number: string; available?: string; sortOrder?: number },
  ) {
    return this.emergencyService.createContact(req.user.id, body);
  }

  @Patch('contacts/:id')
  async updateContact(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() body: { name?: string; number?: string; available?: string; sortOrder?: number },
  ) {
    return this.emergencyService.updateContact(req.user.id, id, body);
  }

  @Delete('contacts/:id')
  async deleteContact(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.emergencyService.deleteContact(req.user.id, id);
  }

  @Get('resources')
  async getResources(@Request() req: { user: { id: string } }) {
    return this.emergencyService.getResources(req.user.id);
  }

  @Post('resources')
  async createResource(
    @Request() req: { user: { id: string } },
    @Body() body: { name: string; description?: string; url: string; sortOrder?: number },
  ) {
    return this.emergencyService.createResource(req.user.id, body);
  }

  @Patch('resources/:id')
  async updateResource(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string; url?: string; sortOrder?: number },
  ) {
    return this.emergencyService.updateResource(req.user.id, id, body);
  }

  @Delete('resources/:id')
  async deleteResource(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    return this.emergencyService.deleteResource(req.user.id, id);
  }
}

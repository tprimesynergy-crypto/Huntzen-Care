import { Controller, Get, Post, Delete, UseGuards, Request, Patch, Param, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { HRService } from './hr.service';

@Controller('hr')
@UseGuards(JwtAuthGuard)
export class HRController {
  constructor(private hrService: HRService) {}

  @Post('invitations')
  async createInvitation(
    @Request() req: { user: { id: string } },
    @Body()
    body: {
      type: 'unique' | 'shared';
      email?: string;
      autoApproved: boolean;
      expiresInDays?: number;
    },
  ) {
    return this.hrService.createInvitation(req.user.id, body);
  }

  @Get('invitations')
  async listInvitations(@Request() req: { user: { id: string } }) {
    return this.hrService.listInvitations(req.user.id);
  }

  @Get('stats')
  async getStats(@Request() req: { user: { id: string } }) {
    return this.hrService.getStats(req.user.id);
  }

  @Get('practitioners')
  async getPractitioners(@Request() req: { user: { id: string } }) {
    return this.hrService.getPractitionerStats(req.user.id);
  }

  @Get('employees')
  async getEmployees(@Request() req: { user: { id: string } }) {
    return this.hrService.getEmployees(req.user.id);
  }

  @Post('employees')
  async createEmployee(
    @Request() req: { user: { id: string } },
    @Body()
    body: {
      email: string;
      firstName: string;
      lastName: string;
      department?: string;
      position?: string;
      phoneNumber?: string;
      temporaryPassword: string;
    },
  ) {
    return this.hrService.createEmployee(req.user.id, body);
  }

  @Get('consultations')
  async getConsultations(@Request() req: { user: { id: string } }) {
    return this.hrService.getConsultations(req.user.id);
  }

  @Patch('employees/:employeeId/activate')
  async activateEmployee(
    @Request() req: { user: { id: string } },
    @Param('employeeId') employeeId: string,
  ) {
    return this.hrService.setEmployeeActive(req.user.id, employeeId, true);
  }

  @Patch('employees/:employeeId/deactivate')
  async deactivateEmployee(
    @Request() req: { user: { id: string } },
    @Param('employeeId') employeeId: string,
  ) {
    return this.hrService.setEmployeeActive(req.user.id, employeeId, false);
  }

  @Patch('employees/:employeeId')
  async updateEmployee(
    @Request() req: { user: { id: string } },
    @Param('employeeId') employeeId: string,
    @Body()
    body: {
      firstName?: string;
      lastName?: string;
      department?: string;
      position?: string;
      phoneNumber?: string;
    },
  ) {
    return this.hrService.updateEmployee(req.user.id, employeeId, body);
  }

  @Delete('employees/:employeeId')
  async deleteEmployee(
    @Request() req: { user: { id: string } },
    @Param('employeeId') employeeId: string,
  ) {
    return this.hrService.deleteEmployee(req.user.id, employeeId);
  }

  @Patch('employees/:employeeId/password')
  async setEmployeePassword(
    @Request() req: { user: { id: string } },
    @Param('employeeId') employeeId: string,
    @Body() body: { newPassword: string },
  ) {
    return this.hrService.setEmployeePassword(req.user.id, employeeId, body.newPassword);
  }
}

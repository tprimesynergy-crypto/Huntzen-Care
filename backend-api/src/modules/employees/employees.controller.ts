import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(private employeesService: EmployeesService) {}

  @Get('me')
  async getMe(@Request() req) {
    return this.employeesService.findMe(req.user.id);
  }
}

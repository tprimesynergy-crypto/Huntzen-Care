import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateEmployeeMeDto } from './dto/update-employee-me.dto';

@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(private employeesService: EmployeesService) {}

  @Get('me')
  async getMe(@Request() req) {
    return this.employeesService.findMe(req.user.id);
  }

  @Patch('me')
  async updateMe(@Request() req, @Body() dto: UpdateEmployeeMeDto) {
    return this.employeesService.updateMe(req.user.id, dto);
  }
}

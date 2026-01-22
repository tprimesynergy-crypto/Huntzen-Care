import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { CompanyService } from './company.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('company')
@UseGuards(JwtAuthGuard)
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Get()
  async getMy(@Request() req: { user: { id: string } }) {
    return this.companyService.getMyCompany(req.user.id);
  }
}

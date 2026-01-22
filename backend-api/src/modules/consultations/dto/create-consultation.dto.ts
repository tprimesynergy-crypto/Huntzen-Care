import { IsString, IsDateString, IsInt, IsOptional, IsEnum } from 'class-validator';

export class CreateConsultationDto {
  @IsString()
  companyId: string;

  @IsString()
  employeeId: string;

  @IsString()
  practitionerId: string;

  @IsDateString()
  scheduledAt: string;

  @IsDateString()
  scheduledEndAt: string;

  @IsOptional()
  @IsInt()
  duration?: number;

  @IsOptional()
  @IsEnum(['VIDEO', 'AUDIO', 'IN_PERSON'])
  format?: string;
}

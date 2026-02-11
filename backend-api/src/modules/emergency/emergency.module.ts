import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EmergencyController } from './emergency.controller';
import { AdminEmergencyController } from './admin-emergency.controller';
import { EmergencyService } from './emergency.service';

@Module({
  imports: [PrismaModule],
  controllers: [EmergencyController, AdminEmergencyController],
  providers: [EmergencyService],
  exports: [EmergencyService],
})
export class EmergencyModule {}

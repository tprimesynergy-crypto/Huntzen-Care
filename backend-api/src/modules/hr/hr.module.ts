import { Module } from '@nestjs/common';
import { HRController } from './hr.controller';
import { HRService } from './hr.service';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [ActivityModule],
  controllers: [HRController],
  providers: [HRService],
  exports: [HRService],
})
export class HRModule {}

import { Module } from '@nestjs/common';
import { PractitionersController } from './practitioners.controller';
import { PractitionersService } from './practitioners.service';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [ActivityModule],
  controllers: [PractitionersController],
  providers: [PractitionersService],
  exports: [PractitionersService],
})
export class PractitionersModule {}

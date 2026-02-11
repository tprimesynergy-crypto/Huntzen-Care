import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConsultationsModule } from './modules/consultations/consultations.module';
import { PractitionersModule } from './modules/practitioners/practitioners.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { NewsModule } from './modules/news/news.module';
import { JournalModule } from './modules/journal/journal.module';
import { MessagesModule } from './modules/messages/messages.module';
import { CompanyModule } from './modules/company/company.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { HRModule } from './modules/hr/hr.module';
import { AdminModule } from './modules/admin/admin.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { EmergencyModule } from './modules/emergency/emergency.module';
import { ActivityModule } from './modules/activity/activity.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    ConsultationsModule,
    PractitionersModule,
    EmployeesModule,
    NewsModule,
    JournalModule,
    MessagesModule,
    CompanyModule,
    NotificationsModule,
    HRModule,
    AdminModule,
    RatingsModule,
    EmergencyModule,
    ActivityModule,
  ],
})
export class AppModule {}

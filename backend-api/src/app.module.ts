import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConsultationsModule } from './modules/consultations/consultations.module';
import { PractitionersModule } from './modules/practitioners/practitioners.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { NewsModule } from './modules/news/news.module';

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
  ],
})
export class AppModule {}

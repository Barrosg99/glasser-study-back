import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { Report, ReportSchema } from './models/report.model';
import { ReportResolver } from './report.resolver';
import { ReportService } from './report.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }]),
  ],
  providers: [ReportResolver, ReportService],
})
export class ReportModule {}

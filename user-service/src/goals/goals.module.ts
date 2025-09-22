import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Goals, GoalsSchema } from './models/goals.model';
import { ConfigModule } from '@nestjs/config';

import { GoalsResolver } from './goals.resolver';
import { GoalsService } from './goals.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Goals.name, schema: GoalsSchema }]),
  ],
  providers: [GoalsResolver, GoalsService],
  exports: [],
})
export class UserModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { GoalsResolver } from './goals.resolver';
import { GoalsService } from './goals.service';

import { Goals, GoalsSchema } from './models/goals.model';
import { User, UserSchema } from 'src/user/models/user.model';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Goals.name, schema: GoalsSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [GoalsResolver, GoalsService],
})
export class GoalsModule {}

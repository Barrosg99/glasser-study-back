import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupResolver } from './group.resolver';
import { Group, GroupSchema } from './models/group.model';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Group.name, schema: GroupSchema }]),
    UserModule,
  ],
  providers: [GroupService, GroupResolver],
})
export class GroupModule {}

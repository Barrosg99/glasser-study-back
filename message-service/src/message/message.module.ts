import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageService } from './message.service';
import { MessageResolver } from './message.resolver';
import { Message, MessageSchema } from './models/message.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  providers: [MessageService, MessageResolver],
  exports: [MessageService],
})
export class MessageModule {}

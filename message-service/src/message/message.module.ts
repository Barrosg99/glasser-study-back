import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import { MessageService } from './message.service';
import { MessageResolver } from './message.resolver';
import { Message, MessageSchema } from './models/message.model';
import { ChatModule } from '../chat/chat.module';
import { Chat, ChatSchema } from 'src/chat/models/chat.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
    RabbitMQModule.forRoot({
      uri: 'amqp://guest:guest@localhost:5672',
      connectionInitOptions: { wait: false },
    }),
    ChatModule,
  ],
  providers: [MessageService, MessageResolver],
  exports: [MessageService],
})
export class MessageModule {}

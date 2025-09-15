import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { MongooseModule } from '@nestjs/mongoose';

import { ChatService } from './chat.service';
import { ChatResolver } from './chat.resolver';
import { Chat, ChatSchema } from './models/chat.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
    RabbitMQModule.forRoot({
      uri: 'amqp://guest:guest@localhost:5672',
      connectionInitOptions: { wait: false },
    }),
  ],
  providers: [ChatService, ChatResolver],
  exports: [ChatService],
})
export class ChatModule {}

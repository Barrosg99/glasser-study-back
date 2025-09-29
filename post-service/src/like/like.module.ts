import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Like, LikeSchema } from './models/like.model';
import { LikeService } from './like.service';
import { LikeResolver } from './like.resolver';
import { Post, PostSchema } from '../post/models/post.model';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Like.name, schema: LikeSchema },
      { name: Post.name, schema: PostSchema },
    ]),
    RabbitMQModule.forRoot({
      uri: 'amqp://guest:guest@localhost:5672',
      connectionInitOptions: { wait: false },
    }),
  ],
  providers: [LikeService, LikeResolver],
  exports: [LikeService],
})
export class LikeModule {}

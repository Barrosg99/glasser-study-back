import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './models/post.model';
import { PostService } from './post.service';
import { PostResolver } from './post.resolver';
import { LikeModule } from '../like/like.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    LikeModule,
  ],
  providers: [PostService, PostResolver],
  exports: [PostService],
})
export class PostModule {}

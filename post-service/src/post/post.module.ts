import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostService } from './post.service';
import { PostResolver } from './post.resolver';
import { Post, PostSchema } from './models/post.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
  ],
  providers: [PostService, PostResolver],
  exports: [PostService],
})
export class PostModule {}

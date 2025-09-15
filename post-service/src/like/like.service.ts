import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Like } from './models/like.model';
import { Post } from '../post/models/post.model';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class LikeService {
  constructor(
    @InjectModel(Like.name) private likeModel: Model<Like>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  async toggleLike(userId: Types.ObjectId, postId: Types.ObjectId) {
    const existingLike = await this.likeModel.findOne({
      user: userId,
      post: postId,
    });

    const post = await this.postModel.findById(postId);

    if (existingLike) {
      await existingLike.deleteOne();
      post.likesCount--;
      await post.save();
      return null;
    }

    const newLike = await this.likeModel.create({
      user: userId,
      post: postId,
    });

    post.likesCount++;
    await post.save();

    if(!post.author.equals(userId)) {
      await this.amqpConnection.publish(
        'notifications_exchange',
        'notification.created',
        {
          userId: post.author,
          message: 'NEW_LIKE',
          type: 'info',
        },
      );
    }

    return newLike;
  }

  async getLikes(postId: Types.ObjectId) {
    return this.likeModel.find({ post: postId }).sort({ createdAt: -1 });
  }

  async hasUserLiked(userId: Types.ObjectId, postId: Types.ObjectId) {
    const like = await this.likeModel.findOne({
      user: userId,
      post: postId,
    });
    return !!like;
  }

  async getPost(postId: Types.ObjectId) {
    return this.postModel.findById(postId);
  }
}

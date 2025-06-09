import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Like } from './models/like.model';
import { Post } from '../post/models/post.model';

@Injectable()
export class LikeService {
  constructor(
    @InjectModel(Like.name) private likeModel: Model<Like>,
    @InjectModel(Post.name) private postModel: Model<Post>,
  ) {}

  async toggleLike(userId: Types.ObjectId, postId: Types.ObjectId) {
    const existingLike = await this.likeModel.findOne({
      user: userId,
      post: postId,
    });

    if (existingLike) {
      await existingLike.deleteOne();
      await this.postModel.updateOne(
        { _id: postId },
        { $inc: { likesCount: -1 } },
      );
      return null;
    }

    const newLike = await this.likeModel.create({
      user: userId,
      post: postId,
    });

    await this.postModel.updateOne(
      { _id: postId },
      { $inc: { likesCount: 1 } },
    );

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

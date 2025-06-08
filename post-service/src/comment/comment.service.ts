import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment } from './models/comment.model';
import { Post } from '../post/models/post.model';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Post.name) private postModel: Model<Post>,
  ) {}

  async createComment(
    userId: Types.ObjectId,
    postId: Types.ObjectId,
    content: string,
  ) {
    const comment = await this.commentModel.create({
      author: userId,
      post: postId,
      content,
    });

    await this.postModel.updateOne(
      { _id: postId },
      { $inc: { commentsCount: 1 } },
    );

    return comment;
  }

  async getComments(postId: Types.ObjectId) {
    return this.commentModel.find({ post: postId }).sort({ createdAt: 1 });
  }

  async deleteComment(commentId: Types.ObjectId, userId: Types.ObjectId) {
    const comment = await this.commentModel.findOne({
      _id: commentId,
      author: userId,
    });

    if (!comment) {
      throw new Error('Comment not found or you are not the author');
    }

    await comment.deleteOne();
    await this.postModel.updateOne(
      { _id: comment.post },
      { $inc: { commentsCount: -1 } },
    );

    return true;
  }

  async getPost(postId: Types.ObjectId) {
    return this.postModel.findById(postId);
  }
}

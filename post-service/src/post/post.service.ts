import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Post } from './models/post.model';
import { SavePostDto } from './dto/save-post.dto';

@Injectable()
export class PostService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  create(savePostInput: SavePostDto, userId: Types.ObjectId): Promise<Post> {
    const createdPost = new this.postModel({
      ...savePostInput,
      author: userId,
    });

    return createdPost.save();
  }

  findAll(userId?: Types.ObjectId): Promise<Post[]> {
    const query: FilterQuery<Post> = {};
    if (userId) {
      query.author = userId;
    }

    return this.postModel.find(query).sort({ updatedAt: -1 });
  }

  findOne(id: string): Promise<Post> {
    return this.postModel.findById(id);
  }

  async update(
    id: string,
    userId: Types.ObjectId,
    updatePostInput: SavePostDto,
  ): Promise<Post> {
    const post = await this.postModel.findOne({ _id: id, author: userId });

    if (!post) throw new Error('Post not found.');

    post.set(updatePostInput);

    return post.save();
  }

  async remove(id: string, userId: Types.ObjectId): Promise<Post> {
    const post = await this.postModel.findOne({ _id: id, author: userId });

    if (!post) throw new Error('Post not found.');

    await post.deleteOne();

    return post;
  }
}

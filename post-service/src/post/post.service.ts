import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Post } from './models/post.model';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  async create(
    createPostInput: CreatePostDto,
    userId: Types.ObjectId,
  ): Promise<Post> {
    const createdPost = new this.postModel({
      ...createPostInput,
      author: userId,
    });

    return createdPost.save();
  }

  async findAll(userId?: Types.ObjectId): Promise<Post[]> {
    const query: FilterQuery<Post> = {};
    if (userId) {
      query.author = userId;
    }

    return this.postModel.find(query).sort({ updatedAt: -1 });
  }

  async findOne(id: string): Promise<Post> {
    return this.postModel.findById(id);
  }

  // async update(id: string, updatePostInput: UpdatePostDto): Promise<Post> {
  //   return this.postModel
  //     .findByIdAndUpdate(id, updatePostInput, { new: true })
  //     .exec();
  // }

  // async remove(id: string): Promise<Post> {
  //   return this.postModel.findByIdAndDelete(id).exec();
  // }
}

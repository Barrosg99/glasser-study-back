import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Post } from './models/post.model';
import { SavePostDto } from './dto/save-post.dto';

@Injectable()
export class PostService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  async save(
    id: string,
    savePostInput: SavePostDto,
    userId: Types.ObjectId,
  ): Promise<Post> {
    if (id) {
      const post = await this.postModel.findOne({ _id: id, author: userId });

      if (!post) throw new Error('Post not found.');

      const normalizedInput = {
        ...savePostInput,
        materials: savePostInput.materials ?? [],
      };

      post.set(normalizedInput);

      return post.save();
    }

    return this.postModel.create({ ...savePostInput, author: userId });
  }

  findAll({
    userId,
    searchTerm,
    searchFilter,
    subject,
    materialType,
  }: {
    userId?: Types.ObjectId;
    searchTerm?: string;
    searchFilter?: string;
    subject?: string;
    materialType?: string;
  }): Promise<Post[]> {
    const query: FilterQuery<Post> = {};
    if (userId) {
      query.author = userId;
    }

    if (searchTerm) {
      if (searchFilter === 'all') {
        query.$or = [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { tags: { $regex: searchTerm, $options: 'i' } },
        ];
      } else if (searchFilter) {
        query[searchFilter] = { $regex: searchTerm, $options: 'i' };
      }
    }

    if (subject) query.subject = subject;

    if (materialType) {
      query.materials = {
        $elemMatch: { type: materialType.toLowerCase() },
      };
    }

    return this.postModel.find(query).sort({ updatedAt: -1 });
  }

  findOne(id: string): Promise<Post> {
    return this.postModel.findById(id);
  }

  async remove(id: string, userId: Types.ObjectId): Promise<Post> {
    const post = await this.postModel.findOne({ _id: id, author: userId });

    if (!post) throw new Error('Post not found.');

    await post.deleteOne();

    return post;
  }
}

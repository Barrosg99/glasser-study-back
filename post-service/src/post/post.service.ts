import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage, Types } from 'mongoose';
import { Post } from './models/post.model';
import { SavePostDto } from './dto/save-post.dto';
import { PostSummaryResponse } from './dto/post-summary.dto';
import { Period } from './dto/post-summary.dto';

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
    isAdmin,
  }: {
    userId?: Types.ObjectId;
    searchTerm?: string;
    searchFilter?: string;
    subject?: string;
    materialType?: string;
    isAdmin?: boolean;
  }): Promise<Post[]> {
    const query: FilterQuery<Post> = {};

    if (!isAdmin) {
      query.isDeleted = false;
    }

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

  countPosts(): Promise<number> {
    return this.postModel.countDocuments();
  }

  findOne(id: string): Promise<Post> {
    return this.postModel.findById(id);
  }

  async remove(params: {
    id: string;
    isAdmin?: boolean;
    userId?: Types.ObjectId;
  }): Promise<Post> {
    const { id, isAdmin, userId } = params;
    const query: FilterQuery<Post> = { _id: id };
    if (!isAdmin) {
      query.author = userId;
    }
    const post = await this.postModel.findOne(query);

    if (!post) throw new Error('Post not found.');

    post.isDeleted = true;
    await post.save();

    return post;
  }

  async summary(period: Period): Promise<PostSummaryResponse> {
    const days = {
      [Period.WEEK]: 7,
      [Period.MONTH]: 30,
      [Period.THREE_MONTHS]: 90,
    };

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days[period]);
    startDate.setHours(0, 0, 0, 0);

    const pipeline: PipelineStage[] = [
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
              timezone: 'America/Sao_Paulo',
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          day: '$_id',
          count: '$count',
        },
      },
      {
        $sort: {
          day: 1,
        },
      },
    ];

    const results = await this.postModel.aggregate(pipeline);

    const labels = [];
    const data = [];

    for (const result of results) {
      const [, month, day] = result.day.split('-');
      labels.push(`${day}/${month}`);
      data.push(result.count);
    }

    return {
      labels,
      data,
    };
  }
}

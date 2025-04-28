import { Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { Group } from './models/group.model';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { User } from 'src/user/models/user.model';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<Group>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createGroupDto: CreateGroupDto, userId: string): Promise<Group> {
    const { memberEmails } = createGroupDto;

    const members = await this.userModel.find({
      email: { $in: memberEmails },
    });

    if (members.length !== memberEmails.length) {
      throw new Error('Some members were not found.');
    }

    const group = await this.groupModel.create({
      ...createGroupDto,
      moderator: userId,
      members: [userId, ...members.map((member) => member._id)],
    });
    return group;
  }

  async findAll(userId?: string): Promise<Group[]> {
    const query: FilterQuery<Group> = {};
    if (userId) {
      query.members = { $in: [userId] };
    }

    return this.groupModel.find(query);
  }

  async findOne(id: string) {
    // TODO: Implement find one group logic
    return {
      id,
      name: 'Test Group',
      description: 'Test Description',
      memberEmails: [],
    };
  }

  async update(id: string, updateGroupDto: CreateGroupDto) {
    // TODO: Implement update group logic
    return {
      id,
      ...updateGroupDto,
    };
  }

  async remove(id: string) {
    // TODO: Implement remove group logic
    return {
      id,
      name: 'Deleted Group',
      description: 'Deleted Description',
      memberEmails: [],
    };
  }
}

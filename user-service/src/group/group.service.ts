import { Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { Group } from './models/group.model';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { User } from 'src/user/models/user.model';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<Group>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createGroupDto: CreateGroupDto, userId: Types.ObjectId): Promise<Group> {
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

  async findAll(userId?: Types.ObjectId): Promise<Group[]> {
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
    const { memberEmails } = updateGroupDto;
    const groupId = new Types.ObjectId(id);

    // Find the existing group
    const existingGroup = await this.groupModel.findById(groupId);
    if (!existingGroup) {
      throw new Error('Group not found');
    }

    // Find new members by email
    const newMembers = await this.userModel.find({
      email: { $in: memberEmails },
    });

    if (newMembers.length !== memberEmails.length) {
      throw new Error('Some members were not found.');
    }

    // Update the group with new data and members
    const updatedGroup = await this.groupModel.findByIdAndUpdate(
      groupId,
      {
        ...updateGroupDto,
        members: [
          existingGroup.moderator,
          ...newMembers.map((member) => member._id),
        ],
      },
      { new: true },
    );

    return updatedGroup;
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

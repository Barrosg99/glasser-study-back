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

  async save(
    group: CreateGroupDto,
    userId: Types.ObjectId,
    id: string,
  ): Promise<Group> {
    const { memberEmails } = group;

    const members = await this.userModel.find({
      email: { $in: memberEmails },
    });

    if (members.length !== memberEmails.length)
      throw new Error('Some members were not found.');

    if (id) {
      const updateGroup = await this.groupModel.findOne({
        _id: id,
        moderator: userId,
      });
      if (!updateGroup) throw new Error('Group not found');

      if (!members.find((member) => member._id.equals(updateGroup.moderator)))
        throw new Error('You cannot remove the moderator from this group.');

      updateGroup.name = group.name;
      updateGroup.description = group.description;
      updateGroup.members = [userId, ...members.map((member) => member._id)];

      return updateGroup.save();
    }

    return this.groupModel.create({
      ...group,
      moderator: userId,
      members: [userId, ...members.map((member) => member._id)],
    });
  }

  async findAll(userId?: Types.ObjectId, search?: string): Promise<Group[]> {
    const query: FilterQuery<Group> = {};
    if (userId) {
      query.members = { $in: [userId] };
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    return this.groupModel.find(query);
  }

  async findOne(id: string): Promise<Group> {
    return this.groupModel.findById(id);
  }

  async remove(id: string, userId: Types.ObjectId) {
    const group = await this.groupModel.findOne({ _id: id, moderator: userId });
    if (!group) throw new Error('Group not found');

    await this.groupModel.deleteOne({ _id: id });
    return group;
  }
}

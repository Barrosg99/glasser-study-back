import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { Chat } from './models/chat.model';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

@Injectable()
export class ChatService {
  constructor(@InjectModel(Chat.name) private chatModel: Model<Chat>) {}

  async save(
    chat: CreateChatDto,
    userId: Types.ObjectId,
    id: string,
  ): Promise<Chat> {
    const membersIds = chat.membersIds?.map((id) => new Types.ObjectId(id));

    // const members = await this.userModel.find({
    //   _id: { $in: memberIds },
    // });

    // if (members.length !== memberEmails.length)
    //   throw new Error('Some members were not found.');

    if (id) {
      const updateChat = await this.chatModel.findOne({
        _id: id,
        moderator: userId,
      });
      if (!updateChat) throw new Error('Chat not found');

      // if (!members.find((member) => member._id.equals(updateChat.moderator)))
      //   throw new Error('You cannot remove the moderator from this chat.');

      const { members, invitedMembers } = updateChat;

      const allMembers = [...members, ...invitedMembers];
      const newMembers = membersIds.filter(
        (id) => !allMembers.find((member) => member.equals(id)),
      );
      const removeMembers = allMembers.filter(
        (id) => !membersIds.find((member) => member.equals(id)),
      );

      const newInvitedMembers = [...invitedMembers, ...newMembers].filter(
        (id) => !removeMembers.find((member) => member.equals(id)),
      );

      updateChat.name = chat.name;
      updateChat.description = chat.description;
      updateChat.members = members.filter(
        (id) => !removeMembers.find((member) => member.equals(id)),
      );
      updateChat.invitedMembers = newInvitedMembers;

      return updateChat.save();
    }

    return this.chatModel.create({
      ...chat,
      moderator: userId,
      members: [userId],
      invitedMembers: membersIds,
    });
  }

  async findAll(userId?: Types.ObjectId, search?: string): Promise<Chat[]> {
    const query: FilterQuery<Chat> = {};
    if (userId) {
      query.$or = [
        { members: { $in: [userId] } },
        { invitedMembers: { $in: [userId] } },
      ];
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    return this.chatModel.find(query);
  }

  async findOne(id: string): Promise<Chat> {
    return this.chatModel.findById(id);
  }

  async remove(id: string, userId: Types.ObjectId) {
    const chat = await this.chatModel.findOne({ _id: id, moderator: userId });
    if (!chat) throw new Error('Chat not found');

    await this.chatModel.deleteOne({ _id: id });
    return chat;
  }

  async manageInvitation(id: string, userId: Types.ObjectId, accept: boolean) {
    const chat = await this.chatModel.findOne({
      _id: id,
      invitedMembers: userId,
    });
    if (!chat) throw new Error('Chat not found');

    if (accept) {
      chat.members.push(userId);
      chat.invitedMembers = chat.invitedMembers.filter(
        (id) => id.toString() !== userId.toString(),
      );
    } else {
      chat.invitedMembers = chat.invitedMembers.filter(
        (id) => id.toString() !== userId.toString(),
      );
    }

    await chat.save();
    return accept;
  }

  async exitChat(id: string, userId: Types.ObjectId) {
    const chat = await this.chatModel.findOne({ _id: id, members: userId });
    if (!chat) throw new Error('Chat not found');

    chat.members = chat.members.filter((id) => id.toString() !== userId.toString());
    await chat.save();
    return true;
  }
}

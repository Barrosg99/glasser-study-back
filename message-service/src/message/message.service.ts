import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

import { Message } from './models/message.model';
import { SaveMessageDto } from './dto/save-message.dto';
import { Chat } from 'src/chat/models/chat.model';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  async save(
    id: string,
    saveMessageInput: SaveMessageDto,
    senderId: Types.ObjectId,
  ): Promise<Message> {
    // if (id) {
    //   const message = await this.messageModel.findOne({ _id: id, senderId });

    //   if (!message) throw new Error('Message not found.');

    //   message.set(saveMessageInput);

    //   return message.save();
    // }

    const message = await this.messageModel.create({
      ...saveMessageInput,
      senderId,
    });

    const chat = await this.chatModel.findById(saveMessageInput.chatId);
    const otherMembers = chat.members.filter(
      (member) => member.user.toString() !== senderId.toString(),
    );

    otherMembers.forEach(async (member) => {
      await this.chatModel.updateOne(
        { _id: chat._id, 'members.user': member.user },
        { $set: { 'members.$.hasRead': false } },
      );

      await this.amqpConnection.publish(
        'notifications_exchange',
        'notification.created',
        {
          userId: member.user.toString(),
          message: 'NEW_MESSAGE',
          type: 'info',
        },
      );
    });

    return message;
  }

  async findAll(params?: {
    userId?: Types.ObjectId;
    chatId?: Types.ObjectId;
    limit?: number;
    skip?: number;
    messageId?: Types.ObjectId;
    isAdmin?: boolean;
  }): Promise<Message[]> {
    const { userId, chatId, messageId, limit, skip, isAdmin } = params;

    const query: FilterQuery<Message> = {};

    if (isAdmin) {
      if (chatId) query.chatId = chatId;
      if (messageId) query._id = messageId;
    } else if (chatId) {
      const chat = await this.chatModel.findById(chatId);
      const isMember = chat.members.find((member) =>
        member.user.equals(userId),
      );
      if (isMember) {
        query.chatId = chatId;
        // update the member has read to true
        await this.chatModel.updateOne(
          { _id: chatId, 'members.user': userId },
          { $set: { 'members.$.hasRead': true } },
        );
      } else {
        throw new Error('You are not a member of this chat.');
      }
    }

    return this.messageModel.find(query, null, {
      limit,
      skip,
      sort: { createdAt: 1 },
    });
  }

  async count(params?: {
    chatId?: Types.ObjectId;
    messageId?: Types.ObjectId;
    isAdmin?: boolean;
  }): Promise<number> {
    const { chatId, isAdmin } = params;
    const query: FilterQuery<Message> = {};
    if (chatId && isAdmin) {
      query.chatId = chatId;
    }
    return this.messageModel.countDocuments(query);
  }

  findOne(id: string): Promise<Message> {
    return this.messageModel.findById(id);
  }

  async findByUsers(
    userId1: Types.ObjectId,
    userId2: Types.ObjectId,
  ): Promise<Message[]> {
    return this.messageModel
      .find({
        $or: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      })
      .sort({ createdAt: 1 });
  }

  async markAsRead(id: string, userId: Types.ObjectId): Promise<Message> {
    const message = await this.messageModel.findOne({
      _id: id,
      receiverId: userId,
    });

    if (!message) throw new Error('Message not found.');

    message.isRead = true;
    return message.save();
  }

  async remove(id: string, userId: Types.ObjectId): Promise<Message> {
    const message = await this.messageModel.findOne({
      _id: id,
      senderId: userId,
    });

    if (!message) throw new Error('Message not found.');

    await message.deleteOne();

    return message;
  }
}

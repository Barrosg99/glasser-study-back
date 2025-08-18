import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Message } from './models/message.model';
import { SaveMessageDto } from './dto/save-message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
  ) {}

  async save(
    id: string,
    saveMessageInput: SaveMessageDto,
    senderId: Types.ObjectId,
  ): Promise<Message> {
    if (id) {
      const message = await this.messageModel.findOne({ _id: id, senderId });

      if (!message) throw new Error('Message not found.');

      message.set(saveMessageInput);

      return message.save();
    }

    return this.messageModel.create({ ...saveMessageInput, senderId });
  }

  findAll(params?: {
    userId?: Types.ObjectId;
    chatId?: Types.ObjectId;
  }): Promise<Message[]> {
    const { userId, chatId } = params;

    const query: FilterQuery<Message> = {};
    if (userId) {
      query.$or = [{ senderId: userId }, { receiverId: userId }];
    }

    if (chatId) {
      query.chatId = chatId;
    }

    return this.messageModel.find(query).sort({ createdAt: 1 });
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

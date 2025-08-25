import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from './models/notification.model';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
    private readonly mailerService: MailerService,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notificationData = {
      ...createNotificationDto,
      recipientId: new Types.ObjectId(createNotificationDto.recipientId),
      ...(createNotificationDto.senderId && { senderId: new Types.ObjectId(createNotificationDto.senderId) }),
    };

    const createdNotification = await this.notificationModel.create(notificationData);
    return createdNotification;
  }

  async findAllByRecipient(recipientId: Types.ObjectId, limit = 20, offset = 0): Promise<Notification[]> {
    return this.notificationModel
      .find({ recipientId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);
  }

  async findUnreadByRecipient(recipientId: Types.ObjectId): Promise<Notification[]> {
    return this.notificationModel
      .find({ recipientId, status: 'unread' })
      .sort({ createdAt: -1 });
  }

  async findOne(id: Types.ObjectId): Promise<Notification> {
    return this.notificationModel.findById(id);
  }

  async update(id: Types.ObjectId, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const filteredData = Object.fromEntries(
      Object.entries(updateNotificationDto).filter(
        ([_, value]) => value !== undefined && value !== null,
      ),
    );

    const updatedNotification = await this.notificationModel.findOneAndUpdate(
      { _id: id },
      { $set: { ...filteredData } },
      { new: true },
    );

    return updatedNotification;
  }

  async markAsRead(id: Types.ObjectId): Promise<Notification> {
    return this.notificationModel.findOneAndUpdate(
      { _id: id },
      { $set: { status: 'read' } },
      { new: true },
    );
  }

  async markAllAsRead(recipientId: Types.ObjectId): Promise<boolean> {
    const result = await this.notificationModel.updateMany(
      { recipientId, status: 'unread' },
      { $set: { status: 'read' } },
    );

    return result.modifiedCount > 0;
  }

  async delete(id: Types.ObjectId): Promise<boolean> {
    const result = await this.notificationModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async deleteByRecipient(recipientId: Types.ObjectId): Promise<boolean> {
    const result = await this.notificationModel.deleteMany({ recipientId });
    return result.deletedCount > 0;
  }

  async sendEmailNotification(notification: Notification, recipientEmail: string): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: recipientEmail,
        subject: notification.title,
        text: notification.message,
        html: `<p>${notification.message}</p>`,
      });
      return true;
    } catch (error) {
      console.error('Failed to send email notification:', error);
      return false;
    }
  }

  async getNotificationCount(recipientId: Types.ObjectId): Promise<{ total: number; unread: number }> {
    const [total, unread] = await Promise.all([
      this.notificationModel.countDocuments({ recipientId }),
      this.notificationModel.countDocuments({ recipientId, status: 'unread' }),
    ]);

    return { total, unread };
  }
}

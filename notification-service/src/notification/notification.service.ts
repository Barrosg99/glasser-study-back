import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from './pub-sub.provider';
import { Notification } from './models/notification.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

interface NotificationPayload {
  id: string;
  userId: string;
  message: string;
}

@Injectable()
export class NotificationService {
  constructor(
    @Inject(PUB_SUB) private pubSub: PubSub,
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  @RabbitSubscribe({
    exchange: 'notifications_exchange',
    routingKey: 'notification.created',
    queue: 'notifications_queue',
  })
  public async handleNewNotification(
    payload: NotificationPayload,
  ): Promise<void> {
    const newNotification = {
      ...payload,
    };

    const notification = await this.notificationModel.create(newNotification);

    await this.pubSub.publish('newNotification', {
      newNotification: notification,
    });
  }

  async notifications(
    userId: string,
    limit: number = 10,
  ): Promise<Notification[]> {
    return this.notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async countUnreadNotifications(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({ userId, read: false });
  }

  async markNotificationAsRead(
    id: string,
    userId: string,
  ): Promise<Notification> {
    const notification = await this.notificationModel.findOne({ _id: id, userId });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.read = true;
    await notification.save();
    return notification;
  }

  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    await this.notificationModel.updateMany({ userId, read: false }, { read: true });
    return true;
  }
}

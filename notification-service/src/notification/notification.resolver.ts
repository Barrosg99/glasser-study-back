import {
  Args,
  Context,
  Mutation,
  Query,
  Resolver,
  ResolveReference,
  Int,
} from '@nestjs/graphql';
import { Notification } from './models/notification.model';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Types } from 'mongoose';

@Resolver((of) => Notification)
export class NotificationResolver {
  constructor(private notificationService: NotificationService) {}

  @Query((returns) => [Notification])
  async myNotifications(
    @Context('userId') userId: Types.ObjectId,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
    @Args('offset', { type: () => Int, defaultValue: 0 }) offset: number,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.notificationService.findAllByRecipient(userId, limit, offset);
  }

  @Query((returns) => [Notification])
  async myUnreadNotifications(@Context('userId') userId: Types.ObjectId) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.notificationService.findUnreadByRecipient(userId);
  }

  @Query((returns) => Notification)
  async notification(
    @Args('id') id: string,
    @Context('userId') userId: Types.ObjectId,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    const notification = await this.notificationService.findOne(new Types.ObjectId(id));

    if (!notification) throw new Error('Notification not found.');

    if (notification.recipientId.toString() !== userId.toString()) {
      throw new Error('You can only view your own notifications.');
    }

    return notification;
  }

  @Query((returns) => Notification)
  async notificationCount(@Context('userId') userId: Types.ObjectId) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.notificationService.getNotificationCount(userId);
  }

  @Mutation((returns) => Notification)
  async createNotification(
    @Args('createNotificationData') createNotificationData: CreateNotificationDto,
    @Context('userId') userId: Types.ObjectId,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    // Only allow creating notifications if you're the sender or it's a system notification
    if (createNotificationData.senderId && createNotificationData.senderId !== userId.toString()) {
      throw new Error('You can only create notifications for yourself.');
    }

    return this.notificationService.create(createNotificationData);
  }

  @Mutation((returns) => Notification)
  async updateNotification(
    @Args('id') id: string,
    @Args('updateNotificationData') updateNotificationData: UpdateNotificationDto,
    @Context('userId') userId: Types.ObjectId,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    const notification = await this.notificationService.findOne(new Types.ObjectId(id));

    if (!notification) throw new Error('Notification not found.');

    if (notification.recipientId.toString() !== userId.toString()) {
      throw new Error('You can only update your own notifications.');
    }

    return this.notificationService.update(new Types.ObjectId(id), updateNotificationData);
  }

  @Mutation((returns) => Notification)
  async markNotificationAsRead(
    @Args('id') id: string,
    @Context('userId') userId: Types.ObjectId,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    const notification = await this.notificationService.findOne(new Types.ObjectId(id));

    if (!notification) throw new Error('Notification not found.');

    if (notification.recipientId.toString() !== userId.toString()) {
      throw new Error('You can only mark your own notifications as read.');
    }

    return this.notificationService.markAsRead(new Types.ObjectId(id));
  }

  @Mutation((returns) => Boolean)
  async markAllNotificationsAsRead(@Context('userId') userId: Types.ObjectId) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.notificationService.markAllAsRead(userId);
  }

  @Mutation((returns) => Boolean)
  async deleteNotification(
    @Args('id') id: string,
    @Context('userId') userId: Types.ObjectId,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    const notification = await this.notificationService.findOne(new Types.ObjectId(id));

    if (!notification) throw new Error('Notification not found.');

    if (notification.recipientId.toString() !== userId.toString()) {
      throw new Error('You can only delete your own notifications.');
    }

    return this.notificationService.delete(new Types.ObjectId(id));
  }

  @ResolveReference()
  resolveReference(reference: {
    __typename: string;
    id: string;
  }): Promise<Notification> {
    return this.notificationService.findOne(new Types.ObjectId(reference.id));
  }
}

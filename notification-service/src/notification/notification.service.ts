import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Inject, Injectable } from '@nestjs/common';
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
}

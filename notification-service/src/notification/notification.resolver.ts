import { Inject } from '@nestjs/common';
import {
  Resolver,
  Subscription,
  Query,
  Context,
  Args,
  Int,
  Mutation,
} from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { Notification } from './models/notification.model';
import { PUB_SUB } from './pub-sub.provider';
import { NotificationService } from './notification.service';

@Resolver(() => Notification)
export class NotificationResolver {
  constructor(
    @Inject(PUB_SUB) private pubSub: PubSub,
    private notificationService: NotificationService,
  ) {}

  @Subscription(() => Notification, {
    nullable: true,
    name: 'newNotification',
    filter: (payload, _, context) => {
      return payload.newNotification.userId === context.userId;
    },
    resolve: (payload) => {
      return payload?.newNotification;
    },
  })
  newNotification(@Context() context: { userId: string }) {
    return this.pubSub.asyncIterableIterator('newNotification');
  }

  @Query(() => [Notification])
  myNotifications(
    @Args('limit', { type: () => Int, nullable: true }) limit: number,
    @Context() context: { userId: string },
  ) {
    return this.notificationService.notifications(context.userId, limit);
  }

  @Query(() => Int)
  countMyUnreadNotifications(@Context() context: { userId: string }) {
    return this.notificationService.countUnreadNotifications(context.userId);
  }

  @Mutation(() => Notification)
  markNotificationAsRead(
    @Args('id') id: string,
    @Context() context: { userId: string },
  ) {
    return this.notificationService.markNotificationAsRead(id, context.userId);
  }

  @Mutation(() => Boolean, { nullable: true })
  markAllNotificationsAsRead(@Context() context: { userId: string }) {
    return this.notificationService.markAllNotificationsAsRead(context.userId);
  }
}

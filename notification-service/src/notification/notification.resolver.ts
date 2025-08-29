import { Inject } from '@nestjs/common';
import { Resolver, Subscription, Query, Context } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { Notification } from './models/notification.model';
import { PUB_SUB } from './pub-sub.provider';

@Resolver(() => Notification)
export class NotificationResolver {
  constructor(@Inject(PUB_SUB) private pubSub: PubSub) {}

  @Query(() => String)
  healthCheck(): string {
    return 'Notification service is running';
  }

  @Subscription(() => Notification, {
    name: 'newNotification',
    filter: (payload, _, context) => {
      return payload.newNotification.userId === context.userId;
    },
    resolve: (payload) => {
      return payload.newNotification;
    },
  })
  newNotification(@Context() context: { userId: string }) {
    return this.pubSub.asyncIterableIterator('newNotification');
  }
}

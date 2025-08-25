import { Field, InputType } from '@nestjs/graphql';
import { NotificationStatus } from '../models/notification.model';

@InputType()
export class UpdateNotificationDto {
  @Field(() => NotificationStatus, { nullable: true })
  readonly status?: NotificationStatus;

  @Field({ nullable: true })
  readonly title?: string;

  @Field({ nullable: true })
  readonly message?: string;
}

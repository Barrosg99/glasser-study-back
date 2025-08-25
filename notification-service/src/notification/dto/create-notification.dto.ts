import { Field, InputType } from '@nestjs/graphql';
import { NotificationType } from '../models/notification.model';

@InputType()
export class CreateNotificationDto {
  @Field()
  readonly title: string;

  @Field()
  readonly message: string;

  @Field(() => NotificationType)
  readonly type: NotificationType;

  @Field()
  readonly recipientId: string;

  @Field({ nullable: true })
  readonly senderId?: string;

  @Field({ nullable: true })
  readonly relatedEntityId?: string;

  @Field({ nullable: true })
  readonly relatedEntityType?: string;
}

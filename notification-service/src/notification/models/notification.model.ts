import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  Directive,
  Field,
  ID,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

export enum NotificationType {
  POST_LIKE = 'post_like',
  POST_COMMENT = 'post_comment',
  NEW_FOLLOWER = 'new_follower',
  CHAT_MESSAGE = 'chat_message',
  SYSTEM = 'system',
}

export enum NotificationStatus {
  READ = 'read',
  UNREAD = 'unread',
}

registerEnumType(NotificationType, { name: 'NotificationType' });
registerEnumType(NotificationStatus, { name: 'NotificationStatus' });

@Schema({ timestamps: true })
@ObjectType()
@Directive('@key(fields: "id")')
export class Notification {
  @Field(() => ID)
  id: Types.ObjectId;

  @Field()
  @Prop({ required: true })
  title: string;

  @Field()
  @Prop({ required: true })
  message: string;

  @Field(() => NotificationType)
  @Prop({
    type: String,
    required: true,
    enum: Object.values(NotificationType),
    message: '{VALUE} is not supported notification type',
  })
  type: NotificationType;

  @Field(() => NotificationStatus)
  @Prop({
    type: String,
    required: true,
    enum: Object.values(NotificationStatus),
    default: NotificationStatus.UNREAD,
  })
  status: NotificationStatus;

  @Field()
  @Prop({ required: true, type: Types.ObjectId })
  recipientId: Types.ObjectId;

  @Field(() => Types.ObjectId, { nullable: true })
  @Prop({ type: Types.ObjectId, required: false })
  senderId?: Types.ObjectId;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  relatedEntityId?: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  relatedEntityType?: string;

  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  updatedAt: Date;
}

export type NotificationDocument = HydratedDocument<Notification>;
export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ recipientId: 1, status: 1 });
NotificationSchema.index({ recipientId: 1, createdAt: -1 });

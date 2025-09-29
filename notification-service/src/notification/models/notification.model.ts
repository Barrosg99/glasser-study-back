import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Field, ObjectType, ID, registerEnumType } from '@nestjs/graphql';

export enum Type {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
}

registerEnumType(Type, { name: 'Type' });

export enum Message {
  NEW_MESSAGE = 'NEW_MESSAGE',
  NEW_CHAT = 'NEW_CHAT',
  NEW_COMMENT = 'NEW_COMMENT',
  NEW_LIKE = 'NEW_LIKE',
}

registerEnumType(Message, { name: 'Message' });

@ObjectType()
@Schema({ timestamps: true })
export class Notification extends Document {
  @Field(() => ID)
  id: string;

  @Field()
  @Prop({ required: true })
  userId: string;

  @Field(() => Message)
  @Prop({ required: true, enum: Object.values(Message) })
  message: Message;

  @Field(() => Type)
  @Prop({ required: true, enum: Object.values(Type) })
  type: Type;

  @Field(() => Boolean)
  @Prop({ required: true, default: false })
  read: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ userId: 1, _id: 1 }, { unique: true });

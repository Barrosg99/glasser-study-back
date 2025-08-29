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

@ObjectType()
@Schema({ timestamps: true })
export class Notification extends Document {
  @Field(() => ID)
  id: string;

  @Field()
  @Prop({ required: true })
  userId: string;

  @Field()
  @Prop({ required: true })
  message: string;

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

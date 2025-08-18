import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';
import { Document, Types } from 'mongoose';

@ObjectType()
@Directive('@extends')
@Directive('@key(fields: "id")')
export class User {
  @Field(() => ID)
  @Directive('@external')
  id: Types.ObjectId;
}

@ObjectType()
@Directive('@extends')
@Directive('@key(fields: "id")')
export class Group {
  @Field(() => ID)
  @Directive('@external')
  id: Types.ObjectId;
}

@ObjectType()
@Schema({ timestamps: true })
export class Message extends Document {
  @Field(() => ID)
  id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  senderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  chatId: Types.ObjectId;

  @Field()
  @Prop({ required: true })
  content: string;

  @Field()
  @Prop({ default: false })
  isRead: boolean;

  @Field()
  @Prop({ default: Date.now })
  createdAt: Date;

  @Field()
  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

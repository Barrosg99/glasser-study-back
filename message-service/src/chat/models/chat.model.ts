import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from 'src/message/models/message.model';

@ObjectType()
export class Member {
  @Field(() => User)
  user: Types.ObjectId;

  @Field(() => Boolean)
  isInvited: boolean;

  @Field(() => Boolean)
  isModerator: boolean;
}

@Schema({ timestamps: true })
@ObjectType()
@Directive('@key(fields: "id")')
export class Chat extends Document {
  @Field(() => ID)
  id: Types.ObjectId;

  @Field(() => String)
  @Prop({ required: true })
  name: string;

  @Field(() => String)
  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  moderator: Types.ObjectId;

  @Field(() => Boolean)
  isModerator: boolean;

  @Field(() => [Member])
  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  members: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  invitedMembers: Types.ObjectId[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

export type ChatDocument = HydratedDocument<Chat>;
export const ChatSchema = SchemaFactory.createForClass(Chat);

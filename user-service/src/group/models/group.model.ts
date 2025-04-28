import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from 'src/user/models/user.model';

@ObjectType()
@Schema({ timestamps: true })
export class Group extends Document {
  @Field(() => ID)
  id: Types.ObjectId;

  @Field(() => String)
  @Prop({ required: true })
  name: string;

  @Field(() => String)
  @Prop({ required: true })
  description: string;

  @Field(() => User)
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  moderator: Types.ObjectId;

  @Field(() => Boolean)
  isModerator: boolean;

  @Field(() => [User])
  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  members: Types.ObjectId[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

export type GroupDocument = HydratedDocument<Group>;
export const GroupSchema = SchemaFactory.createForClass(Group);

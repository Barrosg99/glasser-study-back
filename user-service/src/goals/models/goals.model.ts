import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/user/models/user.model';

@ObjectType()
@Schema({ _id: false, versionKey: false })
export class Task {
  @Field(() => String)
  @Prop({ required: true })
  name: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  link?: string;

  @Field(() => Boolean)
  @Prop({ required: true, default: false })
  completed: boolean;

  @Field(() => Date, { nullable: true })
  @Prop({ required: false })
  completedAt?: Date;
}

@Schema({ timestamps: true })
@ObjectType()
export class Goals extends Document {
  @Field(() => ID, { name: 'id' })
  _id: Types.ObjectId;

  @Field(() => String)
  @Prop({ required: true })
  name: string;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  description: string;

  @Field(() => [Task])
  @Prop({ required: true, ref: Task.name })
  tasks: Task[];

  @Prop({ required: true, ref: User.name })
  userId: Types.ObjectId;

  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  updatedAt: Date;
}

export const GoalsSchema = SchemaFactory.createForClass(Goals);

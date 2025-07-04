import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  Directive,
  Field,
  ID,
  ObjectType,
  registerEnumType,
  Int,
} from '@nestjs/graphql';
import { Document, Types } from 'mongoose';

export enum MaterialType {
  READ = 'read',
  LISTEN = 'listen',
  WATCH = 'watch',
  WATCH_AND_LISTEN = 'watch_and_listen',
  DISCUSS = 'discuss',
  PRACTICE = 'practice',
  TEACHING = 'teaching',
}

registerEnumType(MaterialType, { name: 'MaterialType' });

@ObjectType()
@Schema()
export class Material {
  @Field()
  @Prop({ required: true })
  name: string;

  @Field()
  @Prop({ required: true })
  link: string;

  @Field(() => MaterialType)
  @Prop({ required: true, enum: MaterialType })
  type: MaterialType;
}

@ObjectType()
@Directive('@extends')
@Directive('@key(fields: "id")')
export class User {
  @Field(() => ID)
  @Directive('@external')
  id: Types.ObjectId;
}

@ObjectType()
@Schema({ timestamps: true })
export class Post extends Document {
  @Field(() => ID)
  id: Types.ObjectId;

  @Field()
  @Prop({ required: true })
  title: string;

  @Field()
  @Prop({ required: true })
  subject: string;

  @Field()
  @Prop({ required: true })
  description: string;

  @Field(() => [String], { nullable: true })
  @Prop()
  tags?: string[];

  @Field(() => [Material], { nullable: 'itemsAndList' })
  @Prop()
  materials?: Material[];

  @Field(() => User)
  @Prop({ type: Types.ObjectId })
  author: Types.ObjectId;

  @Field(() => Int)
  @Prop({ default: 0 })
  likesCount: number;

  @Field(() => Int)
  @Prop({ default: 0 })
  commentsCount: number;

  @Field()
  isAuthor: boolean;

  @Field()
  @Prop({ default: Date.now })
  createdAt: Date;

  @Field()
  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);

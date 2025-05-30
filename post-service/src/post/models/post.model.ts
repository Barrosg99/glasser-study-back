import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Directive, Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Document, Types } from 'mongoose';

export enum MaterialType {
  ARTICLE = 'article',
  EXERCISE = 'exercise',
  PODCAST = 'podcast',
  SUMMARY = 'summary',
  SIMULATOR = 'simulator',
  VIDEO = 'video',
  OTHER = 'other',
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

  @Field()
  isAuthor: Boolean;

  @Field()
  @Prop({ default: Date.now })
  createdAt: Date;

  @Field()
  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);

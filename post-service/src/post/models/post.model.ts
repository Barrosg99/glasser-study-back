import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';
import { Document, Types } from 'mongoose';

@ObjectType()
@Schema()
export class Material {
  @Field()
  @Prop({ required: true })
  name: string;

  @Field()
  @Prop({ required: true })
  link: string;

  @Field()
  @Prop({ required: true })
  type: string;
}

@ObjectType()
@Directive('@extends')
@Directive('@key(fields: "id")')
export class User {
  @Field((type) => ID)
  @Directive('@external')
  id: Types.ObjectId;
}

@ObjectType()
@Schema()
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
  @Prop({ default: Date.now })
  createdAt: Date;

  @Field()
  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);

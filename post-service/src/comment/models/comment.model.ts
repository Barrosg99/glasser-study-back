import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Document, Types } from 'mongoose';
import { User } from '../../post/models/post.model';

@ObjectType()
@Schema({ timestamps: true })
export class Comment extends Document {
  @Field(() => ID)
  id: Types.ObjectId;

  @Field()
  @Prop({ required: true })
  content: string;

  @Field(() => User)
  @Prop({ type: Types.ObjectId, required: true })
  author: Types.ObjectId;

  @Field()
  isAuthor: boolean;

  @Field(() => ID)
  @Prop({ type: Types.ObjectId, required: true })
  post: Types.ObjectId;

  @Field()
  @Prop({ default: Date.now })
  createdAt: Date;

  @Field()
  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

// Índices para melhor performance
CommentSchema.index({ post: 1, createdAt: -1 });
CommentSchema.index({ author: 1 });

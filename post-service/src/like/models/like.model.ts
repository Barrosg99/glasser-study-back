import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';
import { Document, Types } from 'mongoose';
import { Post, User } from 'src/post/models/post.model';

// @ObjectType()
// @Directive('@extends')
// @Directive('@key(fields: "id")')
// export class User {
//   @Field(() => ID)
//   @Directive('@external')
//   id: Types.ObjectId;
// }

@ObjectType()
@Schema({ timestamps: true })
export class Like extends Document {
  @Field(() => ID)
  id: Types.ObjectId;

  @Field(() => User)
  @Prop({ type: Types.ObjectId, required: true })
  user: Types.ObjectId;

  @Field(() => Post)
  @Prop({ type: Types.ObjectId, required: true })
  post: Types.ObjectId;

  @Field()
  @Prop({ default: Date.now })
  createdAt: Date;

  @Field()
  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const LikeSchema = SchemaFactory.createForClass(Like);

LikeSchema.index({ post: 1, user: 1 }, { unique: true });
LikeSchema.index({ user: 1 });
LikeSchema.index({ post: 1 });

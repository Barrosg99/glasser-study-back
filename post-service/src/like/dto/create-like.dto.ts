import { Field, ID, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';

@InputType({ description: 'Input data for creating a like' })
export class CreateLikeDto {
  @Field(() => ID)
  postId: Types.ObjectId;
}

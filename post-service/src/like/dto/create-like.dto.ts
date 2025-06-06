import { Field, ID, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';
@InputType()
export class CreateLikeDto {
  @Field(() => ID)
  postId: Types.ObjectId;
}

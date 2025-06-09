import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class CreateCommentDto {
  @Field(() => ID)
  postId: string;

  @Field()
  content: string;
}

import { Field, ID, InputType } from '@nestjs/graphql';

@InputType({ description: 'Input data for creating a comment' })
export class CreateCommentDto {
  @Field(() => ID)
  postId: string;

  @Field()
  content: string;
}

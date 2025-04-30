import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreatePostDto {
  @Field()
  readonly title: string;

  @Field()
  readonly content: string;

  @Field()
  readonly authorId: string;
}

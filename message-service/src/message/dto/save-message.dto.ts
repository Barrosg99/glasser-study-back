import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SaveMessageDto {
  @Field()
  readonly receiverId: string;

  @Field()
  readonly content: string;
}

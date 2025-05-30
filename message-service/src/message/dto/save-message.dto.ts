import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SaveMessageDto {
  @Field({ nullable: true })
  readonly receiverId: string;

  @Field({ nullable: true })
  readonly groupId: string;

  @Field()
  readonly content: string;
}

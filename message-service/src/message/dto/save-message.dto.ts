import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Input data for saving a message' })
export class SaveMessageDto {
  @Field({ nullable: true })
  readonly receiverId: string;

  @Field({ nullable: true })
  readonly chatId: string;

  @Field()
  readonly content: string;
}

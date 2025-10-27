import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';

@InputType({ description: 'Input data for creating a chat' })
export class CreateChatDto {
  @Field()
  readonly name: string;

  @Field()
  readonly description: string;

  @Field(() => [String], { nullable: true })
  readonly membersIds?: Types.ObjectId[];
}

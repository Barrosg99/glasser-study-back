import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';

@InputType()
export class CreateChatDto {
  @Field()
  readonly name: string;

  @Field()
  readonly description: string;

  @Field(() => [String], { nullable: true })
  readonly membersIds?: Types.ObjectId[];
}

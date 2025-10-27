import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { Types } from 'mongoose';

@InputType({ description: 'Input data for querying messages' })
export class QueryMessagesInput {
  @Field(() => ID)
  readonly chatId: Types.ObjectId;

  @Field(() => Int, { nullable: true })
  readonly limit?: number;

  @Field(() => Int, { nullable: true })
  readonly skip?: number;

  @Field(() => ID, { nullable: true })
  readonly messageId?: Types.ObjectId;
}

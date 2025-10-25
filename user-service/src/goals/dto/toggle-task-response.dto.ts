import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Types } from 'mongoose';

@ObjectType({ description: 'Response for toggling a task' })
export class ToggleTaskResponseDto {
  @Field(() => ID)
  goalId: Types.ObjectId;

  @Field(() => Int)
  taskId: number;

  @Field(() => Boolean)
  completed: boolean;
}

import {
  Field,
  Int,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { Period } from 'src/user/dto/user-summary.dto';

@ObjectType()
export class GoalSummaryResponse {
  @Field(() => [Int])
  data: number[];

  @Field(() => [String])
  labels: string[];
}

@InputType()
export class GoalSummaryInput {
  @Field(() => Period)
  period: Period;
}

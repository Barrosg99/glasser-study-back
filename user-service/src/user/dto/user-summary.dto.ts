import {
  Field,
  Int,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

@ObjectType({ description: 'Response for getting a user summary' })
export class UserSummaryResponse {
  @Field(() => [Int])
  data: number[];

  @Field(() => [String])
  labels: string[];
}

export enum Period {
  WEEK = 'week',
  MONTH = 'month',
  THREE_MONTHS = 'three_months',
}

registerEnumType(Period, { name: 'Period', description: 'Represents a period for summary input' });

@InputType({ description: 'Input data for getting a user summary' })
export class UserSummaryInput {
  @Field(() => Period)
  period: Period;
}

import {
  Field,
  Int,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

@ObjectType()
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

registerEnumType(Period, { name: 'Period' });

@InputType()
export class UserSummaryInput {
  @Field(() => Period)
  period: Period;
}

import {
  Field,
  Int,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

@ObjectType()
export class PostSummaryResponse {
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

@InputType({ description: 'Input data for getting a post summary' })
export class PostSummaryInput {
  @Field(() => Period)
  period: Period;
}

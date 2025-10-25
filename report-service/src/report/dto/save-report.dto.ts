import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Input data for saving a report' })
export class SaveReportDto {
  @Field()
  readonly entity: string;

  @Field()
  readonly entityId: string;

  @Field()
  readonly reason: string;

  @Field({ nullable: true })
  readonly description?: string;
}

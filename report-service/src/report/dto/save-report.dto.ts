import { Field, InputType } from '@nestjs/graphql';
import { Entity } from '../models/report.model';

@InputType({ description: 'Input data for saving a report' })
export class SaveReportDto {
  @Field(() => Entity)
  readonly entity: Entity;

  @Field()
  readonly entityId: string;

  @Field()
  readonly reason: string;

  @Field({ nullable: true })
  readonly description?: string;
}

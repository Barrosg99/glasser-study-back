import { Field, InputType } from '@nestjs/graphql';
import { Entity, ReportStatus } from '../models/report.model';

@InputType()
export class QueryReportsDto {
  @Field({ nullable: true })
  readonly status?: ReportStatus;

  @Field({ nullable: true })
  readonly entity?: Entity;

  @Field({ nullable: true })
  readonly reason?: string;
}

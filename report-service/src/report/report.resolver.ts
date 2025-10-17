import { ReportService } from './report.service';
import {
  Args,
  Context,
  ID,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Report, User } from './models/report.model';
import { SaveReportDto } from './dto/save-report.dto';
import { Types } from 'mongoose';

@Resolver((of) => Report)
export class ReportResolver {
  constructor(private reportService: ReportService) {}

  @ResolveField(() => User)
  user(@Parent() report: Report) {
    return { _typename: 'User', id: report.userId };
  }

  @ResolveField(() => [User])
  resolvedBy(@Parent() report: Report) {
    return report.resolvedBy.map((id) => ({ _typename: 'User', id }));
  }

  @Mutation(() => Report)
  async createReport(
    @Context('userId') userId: Types.ObjectId,
    @Args('saveReportDto') saveReportDto: SaveReportDto,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.reportService.create({ saveReportDto, userId });
  }

  @Mutation(() => Boolean)
  async deleteReport(
    @Context('userId') userId: Types.ObjectId,
    @Args('id', { type: () => ID }) id: Types.ObjectId,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.reportService.delete(id, userId);
  }
}

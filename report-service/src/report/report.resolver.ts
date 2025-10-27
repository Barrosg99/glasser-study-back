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
import { QueryReportsDto } from './dto/query-reports.dto';

@Resolver((of) => Report)
export class ReportResolver {
  constructor(private reportService: ReportService) {}

  @ResolveField(() => User)
  user(@Parent() report: Report) {
    return { _typename: 'User', id: report.userId };
  }

  @ResolveField(() => User, { nullable: true })
  resolvedBy(@Parent() report: Report) {
    if (!report.resolvedBy) return null;
    return { _typename: 'User', id: report.resolvedBy };
  }

  @Query(() => [Report], {
    description:
      'Get all reports (admin only), Ex: reports(queryReportsDto: { status: "PENDING", entity: "USER", reason: "Reason 1" })',
  })
  async reports(
    @Args('queryReportsDto', { nullable: true })
    queryReportsDto: QueryReportsDto,
    @Context('isAdmin') isAdmin: boolean,
    @Context('from') from: string,
  ) {
    if (from !== 'admin' || !isAdmin)
      throw new Error('You do not have permission to execute this action.');

    return this.reportService.findAll(queryReportsDto);
  }

  @Query(() => Int, {
    description:
      'Count all reports (admin only), Ex: countReports(queryReportsDto: { status: "PENDING", entity: "USER", reason: "Reason 1" })',
  })
  async countReports(
    @Args('queryReportsDto', { nullable: true })
    queryReportsDto: QueryReportsDto,
    @Context('isAdmin') isAdmin: boolean,
    @Context('from') from: string,
  ) {
    if (from !== 'admin' || !isAdmin)
      throw new Error('You do not have permission to execute this action.');

    return this.reportService.count(queryReportsDto);
  }

  @Query(() => Report, {
    description:
      'Get a report by ID (admin only), Ex: report(id: "1234567890")',
  })
  async report(
    @Context('isAdmin') isAdmin: boolean,
    @Context('from') from: string,
    @Args('id', { type: () => ID }) id: Types.ObjectId,
  ) {
    if (from !== 'admin' || !isAdmin)
      throw new Error('You do not have permission to execute this action.');

    return this.reportService.findOne(id);
  }

  @Mutation(() => Report, {
    description:
      'Create a report, Ex: createReport(saveReportDto: { entity: "USER", entityId: "1234567890", reason: "Reason 1", description: "Description 1" })',
  })
  async createReport(
    @Context('userId') userId: Types.ObjectId,
    @Args('saveReportDto') saveReportDto: SaveReportDto,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.reportService.create({ saveReportDto, userId });
  }

  @Mutation(() => Report, {
    description:
      'Resolve a report, Ex: resolveReport(id: "1234567890", resolvedReason: "Resolved Reason", status: "RESOLVED")',
  })
  async resolveReport(
    @Context('userId') userId: Types.ObjectId,
    @Args('id', { type: () => ID }) id: Types.ObjectId,
    @Args('resolvedReason') resolvedReason: string,
    @Args('status') status: string,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.reportService.resolve({ id, userId, resolvedReason, status });
  }
}

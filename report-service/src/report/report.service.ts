import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Report } from './models/report.model';
import { SaveReportDto } from './dto/save-report.dto';
import { Injectable } from '@nestjs/common';
import { QueryReportsDto } from './dto/query-reports.dto';

@Injectable()
export class ReportService {
  constructor(@InjectModel(Report.name) private reportModel: Model<Report>) {}

  async create(params: {
    saveReportDto: SaveReportDto;
    userId: Types.ObjectId;
  }): Promise<Report> {
    const { saveReportDto, userId } = params;

    const report = new this.reportModel({ ...saveReportDto, userId });

    return await report.save();
  }

  findOne(id: Types.ObjectId): Promise<Report> {
    return this.reportModel.findById(id);
  }

  findAll(queryReportsDto: QueryReportsDto): Promise<Report[]> {
    const query: FilterQuery<Report> = {};

    if (queryReportsDto?.status) query.status = queryReportsDto.status;

    if (queryReportsDto?.entity) query.entity = queryReportsDto.entity;

    if (queryReportsDto?.reason) {
      query.reason = { $regex: queryReportsDto.reason, $options: 'i' };
    }

    return this.reportModel.find(query);
  }

  count(queryReportsDto: QueryReportsDto): Promise<number> {
    const query: FilterQuery<Report> = {};

    if (queryReportsDto?.status) query.status = queryReportsDto.status;

    if (queryReportsDto?.entity) query.entity = queryReportsDto.entity;

    if (queryReportsDto?.reason) {
      query.reason = { $regex: queryReportsDto.reason, $options: 'i' };
    }

    return this.reportModel.countDocuments(query);
  }

  async delete(id: Types.ObjectId, userId: Types.ObjectId): Promise<boolean> {
    const report = await this.reportModel.findOne({ _id: id, userId });

    if (!report) throw new Error('Report not found');

    await report.deleteOne();

    return true;
  }

  async resolve({
    id,
    userId,
    resolvedReason,
    status,
  }: {
    id: Types.ObjectId;
    userId: Types.ObjectId;
    resolvedReason: string;
    status: string;
  }): Promise<Report> {
    return this.reportModel.findByIdAndUpdate(
      id,
      { resolvedReason, status, resolvedBy: userId },
      { returnDocument: 'after' },
    );
  }
}

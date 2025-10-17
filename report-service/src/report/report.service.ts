import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Report } from './models/report.model';
import { SaveReportDto } from './dto/save-report.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<Report>,
  ) {}

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

  find(params: { userId: Types.ObjectId }): Promise<Report[]> {
    return this.reportModel.find({ userId: params.userId });
  }

  async delete(id: Types.ObjectId, userId: Types.ObjectId): Promise<boolean> {
    const report = await this.reportModel.findOne({ _id: id, userId });

    if (!report) throw new Error('Report not found');

    await report.deleteOne();

    return true;
  }
}

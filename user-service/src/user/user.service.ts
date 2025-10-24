import { Model, PipelineStage, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './models/user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { LoggedUserDto, LoggedUserResponse } from './dto/logged-user.dto';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { AdminEditUserDto } from './dto/admin-edit-user.dto';
import {
  Period,
  UserSummaryResponse,
  UserSummaryInput,
} from './dto/user-summary.dto';

const saltOrRounds = 10;

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hasEmailAlready = await this.userModel.findOne({
      email: createUserDto.email,
    });

    if (hasEmailAlready) throw new Error('Email already on use.');

    createUserDto.password = await bcrypt.hash(
      createUserDto.password,
      saltOrRounds,
    );

    const createdUser = await this.userModel.create(createUserDto);
    return createdUser;
  }

  async edit(userData: CreateUserDto, userId: Types.ObjectId): Promise<User> {
    const { email, password } = userData;

    if (email) {
      const hasEmailAlready = await this.userModel.findOne({
        email: userData.email,
        _id: { $ne: userId },
      });

      if (hasEmailAlready) throw new Error('Email already on use.');
    }

    if (password) {
      userData.password = await bcrypt.hash(userData.password, saltOrRounds);
    }

    const filteredData = Object.fromEntries(
      Object.entries(userData).filter(
        ([_, value]) => value !== undefined && value !== null,
      ),
    );

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: userId },
      { $set: { ...filteredData } },
      { new: true },
    );

    return updatedUser;
  }

  async adminEdit(userData: AdminEditUserDto, userId: string): Promise<User> {
    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: userId },
      { $set: userData },
      { new: true },
    );

    return updatedUser;
  }

  async login(
    login: LoggedUserDto,
    from?: string,
  ): Promise<LoggedUserResponse> {
    const { email, password } = login;
    const user = await this.userModel.findOne({ email });

    if (user.blocked) throw new Error('User is blocked.');

    if (from === 'admin' && !user.isAdmin)
      throw new Error('User is not an admin.');

    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new Error('Email or password invalid.');
    }

    const payload = { user: { id: user.id, isAdmin: user.isAdmin } };
    const token = this.jwtService.sign(payload);

    return {
      token,
    };
  }

  async findOne(params: {
    _id?: Types.ObjectId;
    email?: string;
  }): Promise<User> {
    return this.userModel.findOne(params);
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async countUsers(): Promise<number> {
    return this.userModel.countDocuments();
  }

  async findByIds(ids: Types.ObjectId[]): Promise<User[]> {
    return this.userModel.find({ _id: { $in: ids } });
  }

  async resetPassword(email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email });

    if (!user) throw new Error('User not found');

    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!';
    let newPassword = '';
    for (let i = 0; i < 10; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const hashedPassword = await bcrypt.hash(newPassword, saltOrRounds);

    await this.userModel.updateOne(
      { _id: user._id },
      { password: hashedPassword },
    );

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset',
      text: `Your new password is: ${newPassword}`,
      html: `<p>Your new password is: <strong>${newPassword}</strong></p>`,
    });

    return true;
  }

  async summary(period: Period): Promise<UserSummaryResponse> {
    const days = {
      [Period.WEEK]: 7,
      [Period.MONTH]: 30,
      [Period.THREE_MONTHS]: 90,
    };

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days[period]);
    startDate.setHours(0, 0, 0, 0);

    const pipeline: PipelineStage[] = [
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
              timezone: 'America/Sao_Paulo',
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          day: '$_id',
          count: '$count',
        },
      },
      {
        $sort: {
          day: 1,
        },
      },
    ];

    const results = await this.userModel.aggregate(pipeline);

    const labels = [];
    const data = [];

    for (const result of results) {
      const [, month, day] = result.day.split('-');
      labels.push(`${day}/${month}`);
      data.push(result.count);
    }

    return {
      labels,
      data,
    };
  }
}

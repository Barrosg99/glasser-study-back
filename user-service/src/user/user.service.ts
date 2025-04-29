import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './models/user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { LoggedUserDto, LoggedUserResponse } from './dto/logged-user.dto';
import { JwtService } from '@nestjs/jwt';

const saltOrRounds = 10;

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly jwtService: JwtService,
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

  async edit(userData: CreateUserDto, userId: string): Promise<User> {
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

    // Remover campos undefined/null
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

  async login(login: LoggedUserDto): Promise<LoggedUserResponse> {
    const { email, password } = login;
    const user = await this.userModel.findOne({ email });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new Error('Email or password invalid.');
    }

    const payload = { user: { id: user.id } };
    const token = this.jwtService.sign(payload);

    return {
      token,
    };
  }

  async findOne(id: string | Types.ObjectId): Promise<User> {
    return this.userModel.findById(id);
  }

  async findByIds(ids: Types.ObjectId[]): Promise<User[]> {
    return this.userModel.find({ _id: { $in: ids } });
  }
}

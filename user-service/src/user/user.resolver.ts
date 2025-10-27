import {
  Args,
  Context,
  ID,
  Int,
  Mutation,
  Query,
  Resolver,
  ResolveReference,
} from '@nestjs/graphql';
import { User } from './models/user.model';
import { UserService } from './user.service';
import {
  CreateUserDto,
  GetPresignedUrlResponse,
  UpdateUserDto,
} from './dto/create-user.dto';
import { LoggedUserDto, LoggedUserResponse } from './dto/logged-user.dto';
import { Types } from 'mongoose';
import { AdminEditUserDto } from './dto/admin-edit-user.dto';
import { UserSummaryResponse, UserSummaryInput } from './dto/user-summary.dto';

@Resolver((of) => User)
export class UserResolver {
  constructor(private usersService: UserService) {}

  @Query((returns) => User, {
    description:
      'Get the current user, only accessible when the user is logged in',
  })
  async me(@Context('userId') userId: Types.ObjectId) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    const user = await this.usersService.findOne({ _id: userId });

    if (user.blocked) throw new Error('User is blocked.');

    return user;
  }

  @Query((returns) => User, {
    description: 'Get a user by email, Ex: user(email: "test@example.com")',
  })
  async user(
    @Args('email') email: string,
    @Context('userId') userId: Types.ObjectId,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    const user = await this.usersService.findOne({ email });

    if (!user) throw new Error('User not found.');

    if (user.id.toString() !== userId.toString()) {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    }

    return user;
  }

  @Query((returns) => GetPresignedUrlResponse, {
    description: 'Get a presigned URL, Ex: getPresignedUrl(type: "image/jpeg")',
  })
  async getPresignedUrl(
    @Args('type') type: string,
    @Context('userId') userId: Types.ObjectId,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    if (type !== 'image/jpeg' && type !== 'image/png' && type !== 'image/jpg')
      throw new Error('Invalid file type. Only JPEG, PNG and JPG are allowed.');

    return this.usersService.getPresignedUrl(type, userId);
  }

  @Mutation((returns) => User, {
    description:
      'Create a user, Ex: signUp(createUserData: { name: "John Doe", email: "john.doe@example.com", password: "password" })',
  })
  async signUp(@Args('createUserData') createUserData: CreateUserDto) {
    return this.usersService.create(createUserData);
  }

  @Mutation((returns) => User, {
    description:
      'Update the current user, Ex: updateMe(userData: { name: "John Doe", email: "john.doe@example.com", password: "password" })',
  })
  async updateMe(
    @Context('userId') userId: Types.ObjectId,
    @Args('userData') userData: UpdateUserDto,
  ) {
    return this.usersService.edit(userData, userId);
  }

  @Mutation((returns) => LoggedUserResponse, {
    description:
      'Login a user, Ex: login(userLoginData: { email: "john.doe@example.com", password: "password" })',
  })
  async login(
    @Args('userLoginData') userLoginData: LoggedUserDto,
    @Context('from') from: string,
  ) {
    const loginData = await this.usersService.login(userLoginData, from);

    return loginData;
  }

  @Mutation((returns) => Boolean, {
    description:
      'Reset a user password, Ex: resetPassword(email: "john.doe@example.com")',
  })
  async resetPassword(@Args('email') email: string) {
    return this.usersService.resetPassword(email);
  }

  // only for admin
  @Query((returns) => [User], {
    description: 'Get all users (admin only).',
  })
  async adminGetUsers(
    @Context('isAdmin') isAdmin: boolean,
    @Context('from') from: string,
  ) {
    if (from !== 'admin' || !isAdmin)
      throw new Error('You do not have permission to execute this action.');

    return this.usersService.findAll();
  }

  @Query((returns) => Int, { description: 'Count all users (admin only)' })
  async adminCountUsers(
    @Context('isAdmin') isAdmin: boolean,
    @Context('from') from: string,
  ) {
    if (from !== 'admin' || !isAdmin)
      throw new Error('You do not have permission to execute this action.');

    return this.usersService.countUsers();
  }

  @Query((returns) => User, {
    description:
      'Get a user by ID (admin only), Ex: adminGetUser(id: "1234567890")',
  })
  async adminGetUser(
    @Args('id', { type: () => ID }) id: string,
    @Context('isAdmin') isAdmin: boolean,
    @Context('from') from: string,
  ) {
    if (from !== 'admin' || !isAdmin)
      throw new Error('You do not have permission to execute this action.');

    return this.usersService.findOne({ _id: new Types.ObjectId(id) });
  }

  @Query((returns) => UserSummaryResponse, {
    description:
      'Get a user summary (admin only), Ex: adminGetUserSummary(userSummaryInput: { period: "WEEK" })',
  })
  async adminGetUserSummary(
    @Args('userSummaryInput') userSummaryInput: UserSummaryInput,
    @Context('isAdmin') isAdmin: boolean,
    @Context('from') from: string,
  ) {
    if (from !== 'admin' || !isAdmin)
      throw new Error('You do not have permission to execute this action.');

    return this.usersService.summary(userSummaryInput.period);
  }

  @Mutation((returns) => User, {
    description:
      'Edit a user by admin, Ex: adminEditUser(userData: { isAdmin: true, blocked: true }, userId: "1234567890")',
  })
  async adminEditUser(
    @Args('userData') userData: AdminEditUserDto,
    @Args('userId', { type: () => ID }) userId: string,
    @Context('isAdmin') isAdmin: boolean,
    @Context('from') from: string,
  ) {
    if (from !== 'admin' || !isAdmin)
      throw new Error('You do not have permission to execute this action.');

    return this.usersService.adminEdit(userData, userId);
  }

  @ResolveReference()
  resolveReference(reference: {
    __typename: string;
    id: string;
  }): Promise<User> {
    return this.usersService.findOne({ _id: new Types.ObjectId(reference.id) });
  }
}

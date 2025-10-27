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
import { CreateUserDto } from './dto/create-user.dto';
import { LoggedUserDto, LoggedUserResponse } from './dto/logged-user.dto';
import { Types } from 'mongoose';
import { AdminEditUserDto } from './dto/admin-edit-user.dto';
import { UserSummaryResponse, UserSummaryInput } from './dto/user-summary.dto';

@Resolver((of) => User)
export class UserResolver {
  constructor(private usersService: UserService) {}

  @Query((returns) => User)
  async me(@Context('userId') userId: Types.ObjectId) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    const user = await this.usersService.findOne({ _id: userId });

    if (user.blocked) throw new Error('User is blocked.');

    return user;
  }

  @Query((returns) => User)
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

  @Mutation((returns) => User)
  async signUp(@Args('createUserData') createUserData: CreateUserDto) {
    return this.usersService.create(createUserData);
  }

  @Mutation((returns) => User)
  async updateMe(
    @Context('userId') userId: Types.ObjectId,
    @Args('userData') userData: CreateUserDto,
  ) {
    return this.usersService.edit(userData, userId);
  }

  @Mutation((returns) => LoggedUserResponse)
  async login(
    @Args('userLoginData') userLoginData: LoggedUserDto,
    @Context('from') from: string,
  ) {
    const loginData = await this.usersService.login(userLoginData, from);

    return loginData;
  }

  @Mutation((returns) => Boolean)
  async resetPassword(@Args('email') email: string) {
    return this.usersService.resetPassword(email);
  }

  // only for admin
  @Query((returns) => [User])
  async adminGetUsers(
    @Context('isAdmin') isAdmin: boolean,
    @Context('from') from: string,
  ) {
    if (from !== 'admin' || !isAdmin)
      throw new Error('You do not have permission to execute this action.');

    return this.usersService.findAll();
  }

  @Query((returns) => Int)
  async adminCountUsers(
    @Context('isAdmin') isAdmin: boolean,
    @Context('from') from: string,
  ) {
    if (from !== 'admin' || !isAdmin)
      throw new Error('You do not have permission to execute this action.');

    return this.usersService.countUsers();
  }

  @Query((returns) => User)
  async adminGetUser(
    @Args('id', { type: () => ID }) id: string,
    @Context('isAdmin') isAdmin: boolean,
    @Context('from') from: string,
  ) {
    if (from !== 'admin' || !isAdmin)
      throw new Error('You do not have permission to execute this action.');

    return this.usersService.findOne({ _id: new Types.ObjectId(id) });
  }

  @Query((returns) => UserSummaryResponse)
  async adminGetUserSummary(
    @Args('userSummaryInput') userSummaryInput: UserSummaryInput,
    @Context('isAdmin') isAdmin: boolean,
    @Context('from') from: string,
  ) {
    if (from !== 'admin' || !isAdmin)
      throw new Error('You do not have permission to execute this action.');

    return this.usersService.summary(userSummaryInput.period);
  }

  @Mutation((returns) => User)
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

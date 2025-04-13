import {
  Args,
  Context,
  Mutation,
  Query,
  Resolver,
  ResolveReference,
} from '@nestjs/graphql';
import { User } from './models/user.model';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoggedUserDto, LoggedUserResponse } from './dto/logged-user.dto';

@Resolver((of) => User)
export class UserResolver {
  constructor(private usersService: UserService) {}

  @Query((returns) => User)
  async me(@Context('userId') userId: string) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.usersService.findOne(userId);
  }

  @Mutation((returns) => User)
  async signUp(@Args('createUserData') createUserData: CreateUserDto) {
    return this.usersService.create(createUserData);
  }

  @Mutation((returns) => User)
  async updateMe(
    @Context('userId') userId: string,
    @Args('userData') userData: CreateUserDto,
  ) {
    return this.usersService.edit(userData, userId);
  }

  @Mutation((returns) => LoggedUserResponse)
  async login(@Args('userLoginData') userLoginData: LoggedUserDto) {
    const loginData = await this.usersService.login(userLoginData);

    return loginData;
  }

  @ResolveReference()
  resolveReference(reference: {
    __typename: string;
    id: string;
  }): Promise<User> {
    return this.usersService.findOne(reference.id);
  }
}

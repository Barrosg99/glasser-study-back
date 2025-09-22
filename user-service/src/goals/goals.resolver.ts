import { User } from 'src/user/models/user.model';
import { GoalsService } from './goals.service';
import { UserService } from 'src/user/user.service';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Goals } from './models/goals.model';

@Resolver((of) => Goals)
export class GoalsResolver {
  constructor(
    private goalsService: GoalsService,
    private usersService: UserService,
  ) {}

  @ResolveField(() => User)
  async user(@Parent() goals: Goals) {
    return this.usersService.findOne({ _id: goals.userId });
  }
}

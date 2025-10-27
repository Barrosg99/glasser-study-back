import { User } from 'src/user/models/user.model';
import { GoalsService } from './goals.service';
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
import { Goals } from './models/goals.model';
import { SaveGoalDto } from './dto/save-goal.dto';
import { Types } from 'mongoose';
import { ToggleTaskResponseDto } from './dto/toggle-task-response.dto';
import { GoalSummaryInput, GoalSummaryResponse } from './dto/goal-summary.dto';

@Resolver((of) => Goals)
export class GoalsResolver {
  constructor(private goalsService: GoalsService) {}

  @ResolveField(() => User)
  async user(@Parent() goals: Goals) {
    return this.goalsService.getUser(goals.userId);
  }

  @Query(() => [Goals])
  async myGoals(@Context('userId') userId: Types.ObjectId) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.goalsService.find({ userId });
  }

  @Mutation(() => Goals)
  async saveGoal(
    @Context('userId') userId: Types.ObjectId,
    @Args('saveGoalDto') saveGoalDto: SaveGoalDto,
    @Args('id', { type: () => ID, nullable: true }) id?: Types.ObjectId,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.goalsService.save({ id, saveGoalDto, userId });
  }

  @Mutation(() => Boolean)
  async deleteGoal(
    @Context('userId') userId: Types.ObjectId,
    @Args('id', { type: () => ID, nullable: true }) id?: Types.ObjectId,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.goalsService.delete(id, userId);
  }

  @Mutation(() => ToggleTaskResponseDto)
  async toggleTask(
    @Context('userId') userId: Types.ObjectId,
    @Args('goalId', { type: () => ID }) goalId: Types.ObjectId,
    @Args('taskId', { type: () => Int }) taskId: number,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.goalsService.toggleTask({ goalId, taskId, userId });
  }

  @Query(() => GoalSummaryResponse)
  async adminGetGoalSummary(
    @Args('goalSummaryInput') goalSummaryInput: GoalSummaryInput,
    @Context('isAdmin') isAdmin: boolean,
    @Context('from') from: string,
  ) {
    if (from !== 'admin' || !isAdmin)
      throw new Error('You do not have permission to execute this action.');

    return this.goalsService.summary(goalSummaryInput.period);
  }
}

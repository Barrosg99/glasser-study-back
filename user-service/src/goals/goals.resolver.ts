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

  @Query(() => [Goals], { description: 'Get all goals for the current user' })
  async myGoals(@Context('userId') userId: Types.ObjectId) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.goalsService.find({ userId });
  }

  @Mutation(() => Goals, {
    description:
      'Save a goal, Ex: saveGoal(saveGoalDto: { name: "Goal 1", description: "Description 1", tasks: [{ name: "Task 1", link: "https://example.com", completed: true }] })',
  })
  async saveGoal(
    @Context('userId') userId: Types.ObjectId,
    @Args('saveGoalDto') saveGoalDto: SaveGoalDto,
    @Args('id', { type: () => ID, nullable: true }) id?: Types.ObjectId,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.goalsService.save({ id, saveGoalDto, userId });
  }

  @Mutation(() => Boolean, {
    description: 'Delete a goal, Ex: deleteGoal(id: "1234567890")',
  })
  async deleteGoal(
    @Context('userId') userId: Types.ObjectId,
    @Args('id', { type: () => ID, nullable: true }) id?: Types.ObjectId,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.goalsService.delete(id, userId);
  }

  @Mutation(() => ToggleTaskResponseDto, {
    description:
      'Toggle a task, Ex: toggleTask(goalId: "1234567890", taskId: 1)',
  })
  async toggleTask(
    @Context('userId') userId: Types.ObjectId,
    @Args('goalId', { type: () => ID }) goalId: Types.ObjectId,
    @Args('taskId', { type: () => Int }) taskId: number,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.goalsService.toggleTask({ goalId, taskId, userId });
  }

  @Query(() => GoalSummaryResponse, {
    description:
      'Get a goal summary (admin only), Ex: adminGetGoalSummary(goalSummaryInput: { period: "WEEK" })',
  })
  async adminGetGoalSummary(
    @Args('goalSummaryInput') goalSummaryInput: GoalSummaryInput,
    @Context('isAdmin') isAdmin: boolean,
    @Context('from') from: string,
  ) {
    if (from !== 'admin' || !isAdmin)
      throw new Error('You do not have permission to execute this action.');

    return this.goalsService.summary(goalSummaryInput.period);
  }

  @Query(() => Int, { description: 'Get the number of goals' })
  async adminCountGoals(
    @Context('isAdmin') isAdmin: boolean,
    @Context('from') from: string,
  ) {
    if (from !== 'admin' || !isAdmin)
      throw new Error('You do not have permission to execute this action.');

    return this.goalsService.count();
  }

  @Query(() => String, { description: 'Get the percentage of completed goals' })
  async adminGetPercentageOfCompletedGoals(
    @Context('isAdmin') isAdmin: boolean,
    @Context('from') from: string,
  ) {
    if (from !== 'admin' || !isAdmin)
      throw new Error('You do not have permission to execute this action.');

    return this.goalsService.getPercentageOfCompletedGoals();
  }
}

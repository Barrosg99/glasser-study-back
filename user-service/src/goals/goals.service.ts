import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Goals } from './models/goals.model';
import { SaveGoalDto } from './dto/save-goal.dto';
import { User } from 'src/user/models/user.model';
import { Injectable } from '@nestjs/common';
import { ToggleTaskResponseDto } from './dto/toggle-task-response.dto';

@Injectable()
export class GoalsService {
  constructor(
    @InjectModel(Goals.name) private goalsModel: Model<Goals>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async save(params: {
    id?: Types.ObjectId;
    saveGoalDto: SaveGoalDto;
    userId: Types.ObjectId;
  }): Promise<Goals> {
    const { id, saveGoalDto, userId } = params;

    const user = await this.userModel.findOne({
      _id: userId,
    });

    if (!user) throw new Error('User not found');

    if (id) {
      const goal = await this.goalsModel.findById(id);

      if (!goal) throw new Error('Goal not found');

      goal.name = saveGoalDto.name;
      goal.description = saveGoalDto.description;
      goal.tasks = saveGoalDto.tasks;

      return await goal.save();
    }

    const goal = new this.goalsModel({ ...saveGoalDto, userId });

    return await goal.save();
  }

  findOne(id: Types.ObjectId): Promise<Goals> {
    return this.goalsModel.findById(id);
  }

  find(params: { userId: Types.ObjectId }): Promise<Goals[]> {
    return this.goalsModel.find({ userId: params.userId });
  }

  async delete(id: Types.ObjectId, userId: Types.ObjectId): Promise<boolean> {
    const goal = await this.goalsModel.findOne({ _id: id, userId });

    if (!goal) throw new Error('Goal not found');

    await goal.deleteOne();

    return true;
  }

  async getUser(userId: Types.ObjectId): Promise<User> {
    return this.userModel.findById(userId);
  }

  async toggleTask(params: {
    goalId: Types.ObjectId;
    taskId: number;
    userId: Types.ObjectId;
  }): Promise<ToggleTaskResponseDto> {
    const { goalId, taskId, userId } = params;

    const goal = await this.goalsModel.findOne({ _id: goalId, userId });

    if (!goal) throw new Error('Goal not found');

    goal.tasks[taskId].completed = !goal.tasks[taskId].completed;

    if (goal.tasks[taskId].completed) {
      goal.tasks[taskId].completedAt = new Date();
    } else {
      goal.tasks[taskId].completedAt = null;
    }

    goal.markModified('tasks');
    await goal.save();

    return { goalId, taskId, completed: goal.tasks[taskId].completed };
  }
}

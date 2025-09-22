import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Goals } from './models/goals.model';

export class GoalsService {
  constructor(@InjectModel(Goals.name) private goalsModel: Model<Goals>) {
    
  }
}

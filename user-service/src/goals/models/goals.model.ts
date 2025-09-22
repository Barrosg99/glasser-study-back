import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/user/models/user.model';

export enum GoalsStatus {
  TODO = 'todo',
  IN_PROGRESS = 'inProgress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

registerEnumType(GoalsStatus);

@Schema({ timestamps: true })
@ObjectType()
export class Goals extends Document {
  @Field(() => ID, { name: 'id' })
  _id: Types.ObjectId;

  @Field(() => GoalsStatus)
  @Prop({
    required: true,
    enum: {
      values: Object.values(GoalsStatus),
      message: '{VALUE} is not supported goal',
    },
    default: GoalsStatus.TODO,
  })
  status: GoalsStatus;

  @Field(() => String)
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, ref: User.name })
  userId: Types.ObjectId;
}

export const GoalsSchema = SchemaFactory.createForClass(Goals);

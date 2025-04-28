import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  Directive,
  Field,
  ID,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

export enum UserGoal {
  LEARN = 'learn',
  TEACH = 'teach',
  GROUP_STUDY = 'groupStudy',
}

registerEnumType(UserGoal, { name: 'UserGoal' });

@Schema({ timestamps: true })
@ObjectType()
@Directive('@key(fields: "id")')
export class User {
  @Field(() => ID)
  id: Types.ObjectId;
  // id: string;

  @Field()
  @Prop({ required: true })
  name: string;

  @Field()
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Field(() => UserGoal)
  @Prop({
    type: String,
    required: true,
    enum: Object.values(UserGoal),
    message: '{VALUE} is not supported goal',
  })
  goal: UserGoal;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 }, { unique: true });

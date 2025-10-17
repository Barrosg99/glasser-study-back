import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@ObjectType()
@Directive('@extends')
@Directive('@key(fields: "id")')
export class User {
  @Field(() => ID)
  @Directive('@external')
  id: Types.ObjectId;
}

@Schema({ timestamps: true })
@ObjectType()
export class Report extends Document {
  @Field(() => ID, { name: 'id' })
  _id: Types.ObjectId;

  @Field(() => String)
  @Prop({ required: true })
  entity: string;

  @Field(() => String)
  @Prop({ required: true })
  entityId: string;

  @Field(() => String)
  @Prop({ required: true })
  reason: string;

  @Prop({ required: true, type: Types.ObjectId })
  userId: Types.ObjectId;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  description?: string;

  @Prop({ required: false, type: [Types.ObjectId] })
  resolvedBy?: Types.ObjectId[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

export const ReportSchema = SchemaFactory.createForClass(Report);

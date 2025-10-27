import {
  Directive,
  Field,
  ID,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
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

export enum Entity {
  POST = 'post',
  MESSAGE = 'message',
}
export enum ReportStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

registerEnumType(Entity, { name: 'Entity', description: 'Represents an entity that can be reported' });
registerEnumType(ReportStatus, { name: 'ReportStatus', description: 'Represents the status of a report' });

@Schema({ timestamps: true })
@ObjectType({ description: 'Represents a report in the system' })
export class Report extends Document {
  @Field(() => ID, { name: 'id' })
  _id: Types.ObjectId;

  @Field(() => Entity)
  @Prop({ required: true, enum: Entity })
  entity: Entity;

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

  @Prop({ required: false, type: Types.ObjectId })
  resolvedBy?: Types.ObjectId;

  @Field(() => ReportStatus)
  @Prop({ required: true, enum: ReportStatus })
  status: ReportStatus;

  @Field(() => String, { nullable: true })
  @Prop({ required: false })
  resolvedReason?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

export const ReportSchema = SchemaFactory.createForClass(Report);

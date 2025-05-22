import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';
import { Document, Types } from 'mongoose';

@ObjectType()
@Directive('@extends')
@Directive('@key(fields: "id")')
export class User {
  @Field(() => ID)
  @Directive('@external')
  id: Types.ObjectId;
}

@ObjectType()
@Directive('@extends')
@Directive('@key(fields: "id")')
export class Group {
  @Field(() => ID)
  @Directive('@external')
  id: Types.ObjectId;
}

@ObjectType()
@Schema({ timestamps: true })
export class Message extends Document {
  @Field(() => ID)
  id: Types.ObjectId;

  @Field(() => User)
  @Prop({ required: true, type: Types.ObjectId })
  senderId: Types.ObjectId;

  @Field(() => User)
  @Prop({ type: Types.ObjectId })
  receiverId: Types.ObjectId;

  @Field(() => Group)
  @Prop({ type: Types.ObjectId })
  groupId: Types.ObjectId;

  @Field()
  @Prop({ required: true })
  content: string;

  @Field()
  @Prop({ default: false })
  isRead: boolean;

  @Field()
  @Prop({ default: Date.now })
  createdAt: Date;

  @Field()
  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.pre('save', function (next) {
  if (!this.receiverId && !this.groupId) {
    next(new Error('A mensagem deve ter um receiverId ou um groupId'));
  } else if (this.receiverId && this.groupId) {
    next(
      new Error('A mensagem não pode ter receiverId e groupId simultaneamente'),
    );
  } else {
    next();
  }
});

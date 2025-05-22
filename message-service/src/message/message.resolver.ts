import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Context,
  Parent,
  ResolveField,
} from '@nestjs/graphql';
import { MessageService } from './message.service';
import { Message, User } from './models/message.model';
import { SaveMessageDto } from './dto/save-message.dto';
import { Types } from 'mongoose';

@Resolver(() => Message)
export class MessageResolver {
  constructor(private readonly messageService: MessageService) {}

  @ResolveField(() => User)
  async sender(@Parent() message: Message) {
    return { _typename: 'User', id: message.senderId };
  }

  @ResolveField(() => User)
  async receiver(@Parent() message: Message) {
    return { _typename: 'User', id: message.receiverId };
  }

  @Mutation(() => Message)
  saveMessage(
    @Context('userId') userId: Types.ObjectId,
    @Args('saveMessageInput') saveMessageInput: SaveMessageDto,
    @Args('id', { type: () => ID, nullable: true }) id?: string,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.messageService.save(id, saveMessageInput, userId);
  }

  @Query(() => [Message], { name: 'messages' })
  findAll() {
    return this.messageService.findAll();
  }

  @Query(() => Message, { name: 'message' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.messageService.findOne(id);
  }

  @Query(() => [Message], { name: 'myMessages' })
  findMyMessages(@Context('userId') userId: Types.ObjectId) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.messageService.findAll(userId);
  }

  @Query(() => [Message], { name: 'conversation' })
  findConversation(
    @Context('userId') userId: Types.ObjectId,
    @Args('otherUserId', { type: () => ID }) otherUserId: string,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.messageService.findByUsers(
      userId,
      new Types.ObjectId(otherUserId),
    );
  }

  @Mutation(() => Message)
  markMessageAsRead(
    @Context('userId') userId: Types.ObjectId,
    @Args('id', { type: () => ID }) id: string,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.messageService.markAsRead(id, userId);
  }

  @Mutation(() => Message)
  removeMessage(
    @Context('userId') userId: Types.ObjectId,
    @Args('id', { type: () => ID }) id: string,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.messageService.remove(id, userId);
  }
}

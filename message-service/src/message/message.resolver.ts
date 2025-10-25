import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Context,
  Parent,
  ResolveField,
  Int,
} from '@nestjs/graphql';
import { MessageService } from './message.service';
import { Message, User } from './models/message.model';
import { SaveMessageDto } from './dto/save-message.dto';
import { Types } from 'mongoose';
import { Chat } from '../chat/models/chat.model';
import { ChatService } from '../chat/chat.service';
import { QueryMessagesInput } from './dto/query-messages.dto';

@Resolver(() => Message)
export class MessageResolver {
  constructor(
    private readonly messageService: MessageService,
    private readonly chatService: ChatService,
  ) {}

  @ResolveField(() => User, { description: 'Get the sender of a message' })
  sender(@Parent() message: Message) {
    return { _typename: 'User', id: message.senderId };
  }

  @ResolveField(() => Chat, { description: 'Get the chat of a message' })
  chat(@Parent() message: Message) {
    return this.chatService.findOne({ _id: message.chatId.toString() });
  }

  @ResolveField(() => Boolean, {
    description: 'Check if the current user is the sender of the message',
  })
  isCurrentUser(
    @Parent() message: Message,
    @Context('userId') userId: Types.ObjectId,
  ) {
    return message.senderId.equals(userId);
  }

  @Mutation(() => Message, {
    description:
      'Save a message, Ex: saveMessage(saveMessageDto: { receiverId: "1234567890", chatId: "1234567890", content: "Message content" })',
  })
  saveMessage(
    @Context('userId') userId: Types.ObjectId,
    @Args('saveMessageInput') saveMessageInput: SaveMessageDto,
    @Args('id', { type: () => ID, nullable: true }) id?: string,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    if (
      (!saveMessageInput.chatId && !saveMessageInput.receiverId) ||
      (saveMessageInput.chatId && saveMessageInput.receiverId)
    ) {
      throw new Error('You must provide a chatId or receiverId');
    }

    return this.messageService.save(id, saveMessageInput, userId);
  }

  @Query(() => [Message], { name: 'messages', description: 'Get all messages' })
  findAll() {
    return this.messageService.findAll();
  }

  @Query(() => Message, {
    name: 'message',
    description: 'Get a message by ID, Ex: message(id: "1234567890")',
  })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.messageService.findOne(id);
  }

  @Query(() => [Message], {
    name: 'chatMessages',
    description:
      'Get all messages for a chat, Ex: chatMessages(chatId: "1234567890")',
  })
  findChatMessages(
    @Context('userId') userId: Types.ObjectId,
    @Args('chatId', { type: () => ID }) chatId: Types.ObjectId,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.messageService.findAll({ chatId, userId });
  }

  @Query(() => [Message], {
    name: 'myMessages',
    description: 'Get all messages for the current user, Ex: myMessages()',
  })
  findMyMessages(@Context('userId') userId: Types.ObjectId) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.messageService.findAll({ userId });
  }

  @Query(() => [Message], {
    name: 'conversation',
    description:
      'Get a conversation with another user, Ex: conversation(otherUserId: "1234567890")',
  })
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

  @Mutation(() => Message, {
    description:
      'Mark a message as read, Ex: markMessageAsRead(id: "1234567890")',
  })
  markMessageAsRead(
    @Context('userId') userId: Types.ObjectId,
    @Args('id', { type: () => ID }) id: string,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.messageService.markAsRead(id, userId);
  }

  @Mutation(() => Message, {
    description: 'Remove a message, Ex: removeMessage(id: "1234567890")',
  })
  removeMessage(
    @Context('userId') userId: Types.ObjectId,
    @Args('id', { type: () => ID }) id: string,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.messageService.remove(id, userId);
  }

  // only for admin
  @Query(() => [Message], { description: 'Get all messages (admin only)' })
  adminGetMessages(
    @Context('isAdmin') isAdmin: boolean,
    @Context('from') from: string,
    @Args('queryMessagesInput', { type: () => QueryMessagesInput })
    queryMessagesInput: QueryMessagesInput,
  ) {
    if (from !== 'admin' || !isAdmin)
      throw new Error('You must be admin to execute this action.');

    return this.messageService.findAll({
      chatId: queryMessagesInput.chatId,
      limit: queryMessagesInput.limit,
      skip: queryMessagesInput.skip,
      messageId: queryMessagesInput.messageId,
      isAdmin,
    });
  }

  @Query(() => Int, { description: 'Count all messages (admin only)' })
  adminCountMessages(
    @Context('isAdmin') isAdmin: boolean,
    @Context('from') from: string,
    @Args('queryMessagesInput', { type: () => QueryMessagesInput })
    queryMessagesInput: Omit<QueryMessagesInput, 'limit' | 'skip'>,
  ) {
    if (from !== 'admin' || !isAdmin)
      throw new Error('You must be admin to execute this action.');

    return this.messageService.count({
      chatId: queryMessagesInput.chatId,
      messageId: queryMessagesInput.messageId,
      isAdmin,
    });
  }

  @Query(() => Message, {
    description:
      'Get a message by ID (admin only), Ex: adminGetMessage(id: "1234567890")',
  })
  adminGetMessage(
    @Context('isAdmin') isAdmin: boolean,
    @Context('from') from: string,
    @Args('id', { type: () => ID }) id: string,
  ) {
    if (from !== 'admin' || !isAdmin)
      throw new Error('You must be admin to execute this action.');
    return this.messageService.findOne(id);
  }
}

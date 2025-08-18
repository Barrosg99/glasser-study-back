import {
  Resolver,
  Query,
  Mutation,
  Args,
  Context,
  ResolveField,
  Parent,
  ResolveReference,
} from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { Chat } from './models/chat.model';
import { Types } from 'mongoose';
import { User } from 'src/message/models/message.model';

@Resolver((of) => Chat)
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}

  @ResolveField(() => [User])
  members(@Parent() chat: Chat) {
    return chat.members.map((member) => ({ _typename: 'User', id: member }));
  }

  @ResolveField(() => User)
  moderator(@Parent() chat: Chat) {
    return { _typename: 'User', id: chat.moderator };
  }

  @ResolveField(() => Boolean)
  isModerator(@Parent() chat: Chat, @Context('userId') userId: Types.ObjectId) {
    return chat.moderator.equals(userId);
  }

  @Query((returns) => [Chat])
  myChats(
    @Context('userId') userId: Types.ObjectId,
    @Args('search', { type: () => String, nullable: true }) search: string,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.chatService.findAll(userId, search);
  }

  @Mutation((returns) => Chat)
  saveChat(
    @Context('userId') userId: Types.ObjectId,
    @Args('id', { type: () => String, nullable: true }) id: string,
    @Args('saveChatData') saveChatDto: CreateChatDto,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.chatService.save(saveChatDto, userId, id);
  }

  @Mutation((returns) => Chat)
  removeChat(
    @Context('userId') userId: Types.ObjectId,
    @Args('id', { type: () => String }) id: string,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.chatService.remove(id, userId);
  }

  @ResolveReference()
  resolveReference(reference: {
    __typename: string;
    id: string;
  }): Promise<Chat> {
    return this.chatService.findOne(reference.id);
  }
}

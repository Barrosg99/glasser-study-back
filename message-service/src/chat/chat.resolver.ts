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
import { Chat, Member } from './models/chat.model';
import { Types } from 'mongoose';

@Resolver((of) => Chat)
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}

  @ResolveField(() => [Member])
  members(@Parent() chat: Chat) {
    const members = [...chat.members, ...chat.invitedMembers];

    return members.map((member) => ({
      _typename: 'Member',
      user: { _typename: 'User', id: member },
      isInvited: !!chat.invitedMembers.find((id) => id.equals(member)),
      isModerator: chat.moderator.equals(member),
    }));
  }

  @ResolveField(() => Boolean)
  isModerator(@Parent() chat: Chat, @Context('userId') userId: Types.ObjectId) {
    return chat.moderator.equals(userId);
  }

  @ResolveField(() => Boolean)
  isInvited(@Parent() chat: Chat, @Context('userId') userId: Types.ObjectId) {
    return chat.invitedMembers.includes(userId);
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

  @Mutation((returns) => Boolean)
  manageInvitation(
    @Context('userId') userId: Types.ObjectId,
    @Args('id', { type: () => String }) id: string,
    @Args('accept', { type: () => Boolean }) accept: boolean,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.chatService.manageInvitation(id, userId, accept);
  }

  @Mutation((returns) => Boolean)
  exitChat(
    @Context('userId') userId: Types.ObjectId,
    @Args('id', { type: () => String }) id: string,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');
    return this.chatService.exitChat(id, userId);
  }

  @ResolveReference()
  resolveReference(reference: {
    __typename: string;
    id: string;
  }): Promise<Chat> {
    return this.chatService.findOne(reference.id);
  }
}

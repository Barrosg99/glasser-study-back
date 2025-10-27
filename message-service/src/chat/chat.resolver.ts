import {
  Resolver,
  Query,
  Mutation,
  Args,
  Context,
  ResolveField,
  Parent,
  ResolveReference,
  Int,
} from '@nestjs/graphql';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { Chat, Member } from './models/chat.model';
import { Types } from 'mongoose';

@Resolver((of) => Chat)
export class ChatResolver {
  constructor(private readonly chatService: ChatService) {}

  @ResolveField(() => [Member], { description: 'Get the members of a chat' })
  members(@Parent() chat: Chat) {
    const members = [
      ...chat.members.map((member) => member.user),
      ...chat.invitedMembers,
    ];

    return members.map((member) => ({
      _typename: 'Member',
      user: { _typename: 'User', id: member },
      isInvited: !!chat.invitedMembers.find((id) => id.equals(member)),
      isModerator: chat.moderator.equals(member),
    }));
  }

  @ResolveField(() => Boolean, {
    description: 'Check if the current user is a moderator of the chat',
  })
  isModerator(@Parent() chat: Chat, @Context('userId') userId: Types.ObjectId) {
    return chat.moderator.equals(userId);
  }

  @ResolveField(() => Boolean, {
    description: 'Check if the current user is invited to the chat',
  })
  isInvited(@Parent() chat: Chat, @Context('userId') userId: Types.ObjectId) {
    return chat.invitedMembers.includes(userId);
  }

  @ResolveField(() => Boolean, {
    description: 'Check if the current user has read the chat',
  })
  hasRead(@Parent() chat: Chat, @Context('userId') userId: Types.ObjectId) {
    return !!chat.members.find((member) => member.user.equals(userId))?.hasRead;
  }

  @Query((returns) => [Chat], {
    description:
      'Get all chats for the current user, Ex: myChats(search: "Search term")',
  })
  myChats(
    @Context('userId') userId: Types.ObjectId,
    @Args('search', { type: () => String, nullable: true }) search: string,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.chatService.findAll(userId, search);
  }

  @Mutation((returns) => Chat, {
    description:
      'Save a chat, Ex: saveChat(saveChatDto: { name: "Chat 1", description: "Chat description", membersIds: ["1234567890", "1234567891"] })',
  })
  saveChat(
    @Context('userId') userId: Types.ObjectId,
    @Args('id', { type: () => String, nullable: true }) id: string,
    @Args('saveChatData') saveChatDto: CreateChatDto,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.chatService.save(saveChatDto, userId, id);
  }

  @Mutation((returns) => Chat, {
    description: 'Remove a chat, Ex: removeChat(id: "1234567890")',
  })
  removeChat(
    @Context('userId') userId: Types.ObjectId,
    @Args('id', { type: () => String }) id: string,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.chatService.remove(id, userId);
  }

  @Mutation((returns) => Boolean, {
    description:
      'Manage an invitation, Ex: manageInvitation(id: "1234567890", accept: true)',
  })
  manageInvitation(
    @Context('userId') userId: Types.ObjectId,
    @Args('id', { type: () => String }) id: string,
    @Args('accept', { type: () => Boolean }) accept: boolean,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.chatService.manageInvitation(id, userId, accept);
  }

  @Mutation((returns) => Boolean, {
    description: 'Exit a chat, Ex: exitChat(id: "1234567890")',
  })
  exitChat(
    @Context('userId') userId: Types.ObjectId,
    @Args('id', { type: () => String }) id: string,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');
    return this.chatService.exitChat(id, userId);
  }

  // only for admin
  @Query((returns) => [Chat], { description: 'Get all chats (admin only)' })
  adminGetChats(
    @Context('isAdmin') isAdmin: boolean,
    @Context('from') from: string,
  ) {
    if (!isAdmin) throw new Error('You must be admin to execute this action.');

    return this.chatService.findAll();
  }

  @Query((returns) => Int, { description: 'Count all chats (admin only)' })
  adminCountChats(
    @Context('isAdmin') isAdmin: boolean,
    @Context('from') from: string,
  ) {
    if (from !== 'admin' || !isAdmin)
      throw new Error('You must be admin to execute this action.');

    return this.chatService.countChats();
  }

  @Query((returns) => Chat, {
    description:
      'Get a chat by ID (admin only), Ex: adminGetChat(id: "1234567890")',
  })
  adminGetChat(
    @Context('isAdmin') isAdmin: boolean,
    @Context('from') from: string,
    @Args('id', { type: () => String }) id: string,
  ) {
    if (from !== 'admin' || !isAdmin)
      throw new Error('You must be admin to execute this action.');
    return this.chatService.findOne({ _id: id });
  }

  @ResolveReference()
  resolveReference(reference: {
    __typename: string;
    id: string;
  }): Promise<Chat> {
    return this.chatService.findOne({ _id: reference.id });
  }
}

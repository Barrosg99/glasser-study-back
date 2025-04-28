import { Resolver, Query, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { Group } from './models/group.model';

@Resolver((of) => Group)
export class GroupResolver {
  constructor(private readonly groupService: GroupService) {}

  @Mutation((returns) => Group)
  createGroup(
    @Context('userId') userId: string,
    @Args('createGroupData') createGroupDto: CreateGroupDto,
  ) {
    if (!userId) throw new Error('You must be logged to execute this action.');

    return this.groupService.create(createGroupDto, userId);
  }

  // @Query('groups')
  // findAll() {
  //   return this.groupService.findAll();
  // }

  // @Query('group')
  // findOne(@Args('id', { type: () => ID }) id: string) {
  //   return this.groupService.findOne(id);
  // }

  // @Mutation('updateGroup')
  // update(
  //   @Args('id', { type: () => ID }) id: string,
  //   @Args('updateGroupData') updateGroupDto: CreateGroupDto,
  // ) {
  //   return this.groupService.update(id, updateGroupDto);
  // }

  // @Mutation('removeGroup')
  // remove(@Args('id', { type: () => ID }) id: string) {
  //   return this.groupService.remove(id);
  // }
}

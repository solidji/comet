import { Field, ID, InputType } from 'type-graphql'
import { Context } from '@/types'
import { Group, Message, MessageType, User } from '@/entity'

@InputType()
export class AddUserToGroupInput {
  @Field(() => ID)
  groupId: string

  @Field(() => ID)
  userId: string
}

export async function addUserToGroup(
  { em, user: currentUser, liveQueryStore }: Context,
  { groupId, userId }: AddUserToGroupInput
): Promise<Group> {
  const group = await em.findOneOrFail(Group, groupId, ['users', 'owner'])
  const user = await em.findOneOrFail(User, userId)
  await currentUser.checkInGroup(em, group.id)
  group.users.add(user)
  const message = em.create(Message, {
    author: user,
    type: MessageType.Join,
    group
  })
  await em.persistAndFlush([group, message])
  liveQueryStore.invalidate(`Group:${groupId}`)
  return group
}

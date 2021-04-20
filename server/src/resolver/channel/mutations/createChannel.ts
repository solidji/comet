import { Context } from '@/types'
import { Field, ID, InputType } from 'type-graphql'
import { Channel, Server, ServerPermission, User } from '@/entity'
import { QueryOrder } from '@mikro-orm/core'
import { ReorderUtils } from '@/util'

@InputType()
export class CreateChannelInput {
  @Field(() => ID)
  serverId: string

  @Field()
  name: string

  @Field({ defaultValue: false })
  isPrivate: boolean = false
}

export async function createChannel(
  { em, userId, liveQueryStore }: Context,
  { serverId, name, isPrivate }: CreateChannelInput
): Promise<Channel> {
  const user = await em.findOneOrFail(User, userId)
  await user.checkServerPermission(
    em,
    serverId,
    ServerPermission.ManageChannels
  )

  const server = await em.findOneOrFail(Server, serverId)

  const firstChannel = await em.findOne(
    Channel,
    { server },
    { orderBy: { position: 'ASC' } }
  )

  const channel = em.create(Channel, {
    name,
    server,
    isPrivate,
    position: firstChannel
      ? ReorderUtils.positionBefore(firstChannel.position)
      : ReorderUtils.FIRST_POSITION
  })

  await em.persistAndFlush(channel)
  liveQueryStore.invalidate(`Server:${serverId}`)
  return channel
}

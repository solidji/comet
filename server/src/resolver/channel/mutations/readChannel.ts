import { Field, ID, InputType } from 'type-graphql'
import { Context } from '@/types'
import { Channel, ChannelUser } from '@/entity'

@InputType()
export class ReadChannelInput {
  @Field(() => ID)
  channelId: string
}

export async function readChannel(
  { em, user, liveQueryStore }: Context,
  { channelId }: ReadChannelInput
): Promise<Channel> {
  const channel = await em.findOneOrFail(Channel, channelId, ['server'])
  let channelUser = await em.findOne(ChannelUser, { user, channel })
  if (!channelUser) channelUser = em.create(ChannelUser, { user, channel })
  channelUser.lastViewAt = new Date()
  channelUser.mentionCount = 0
  channel.isUnread = false
  channel.mentionCount = 0
  await em.persistAndFlush(channelUser)
  liveQueryStore.invalidate(`Channel:${channelId}`)
  return channel
}

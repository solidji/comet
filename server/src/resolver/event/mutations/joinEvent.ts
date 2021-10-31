import {
  Channel,
  Message,
  MessageType,
  Event,
  EventUser,
  EventUserStatus,
  User
} from '@/entity'
import { Field, ID, InputType } from 'type-graphql'
import { Context } from '@/types'
import {logger, ReorderUtils} from '@/util'
import { ChangePayload, ChangeType } from '@/resolver/subscriptions'
import { Publisher } from 'type-graphql/dist/interfaces/Publisher'

@InputType()
export class JoinEventInput {
  @Field(() => ID, { nullable: true })
  eventId: string
}

export async function joinEvent(
  { em, userId, liveQueryStore }: Context,
  { eventId }: JoinEventInput,
  notifyEventChanged: Publisher<ChangePayload>
): Promise<Event> {
  logger('joinEvent')
  const user = await em.findOneOrFail(User, userId)
  let event = await em.findOneOrFail(Event, eventId)
  const firstUser = await em.findOne(
    EventUser,
    { user },
    ['event'],
    { position: 'ASC' }
  )
  let eventUser = await em.findOne(EventUser, {
    event,
    user
  })
  if (eventUser && eventUser.status === EventUserStatus.Joined)
    throw new Error('Already joined this event')
  if (!eventUser) {
    eventUser = em.create(EventUser, {
      event,
      user
    })
  }
  eventUser.status = EventUserStatus.Joined
  eventUser.position = firstUser
    ? ReorderUtils.positionBefore(firstUser.position)
    : ReorderUtils.FIRST_POSITION
    event.userCount++
  await em.persistAndFlush([eventUser, event])
  liveQueryStore.invalidate(`Query.eventUsers(eventId:"${event.id}")`)
  event.isJoined = true
  // const defaultChannel = await em.findOne(Channel, { server, isDefault: true })
  // if (defaultChannel) {
  //   const joinMessage = em.create(Message, {
  //     author: user,
  //     type: MessageType.Join,
  //     channel: defaultChannel
  //   })
  //   await em.persistAndFlush(joinMessage)
  //   await notifyMessageChanged({ type: ChangeType.Added, id: joinMessage.id })
  // }
  return event
}

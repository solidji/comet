import { Field, ID, InputType } from 'type-graphql'
import { Context } from '@/types'
import { Event, EventUser, EventUserStatus, User } from '@/entity'
import {logger} from "@/util";

@InputType()
export class LeaveEventInput {
  @Field(() => ID)
  eventId: string
}

export async function leaveEvent(
  { em, userId, liveQueryStore }: Context,
  { eventId }: LeaveEventInput
): Promise<Event> {
  logger('leaveEvent')
  const event = await em.findOneOrFail(Event, eventId, ['owner'])
  if (event.owner === em.getReference(User, userId))
    throw new Error('Cannot leave if owner')
  const eventUser = await em.findOneOrFail(EventUser, {
    user: userId,
    event: eventId,
    status: EventUserStatus.Joined
  })
  eventUser.status = EventUserStatus.None
  event.userCount--
  await em.persistAndFlush([eventUser, event])
  liveQueryStore.invalidate([
    `Query.eventUsers(eventId:"${event.id}")`
  ])
  event.isJoined = false
  return event
}

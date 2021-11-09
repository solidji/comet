import { Field, ID, InputType } from 'type-graphql'
import { Context } from '@/types'
import { EventUser, Event, EventUserStatus, User } from '@/entity'
import * as argon2 from 'argon2'
import {logger} from "@/util";

@InputType()
export class DeleteEventInput {
  @Field(() => ID)
  eventId: string
}

export async function deleteEvent(
  { em, userId, liveQueryStore }: Context,
  { eventId }: DeleteEventInput
): Promise<string> {
  logger('deleteEvent')
  const user = await em.findOneOrFail(User, userId)

  const event = await em.findOneOrFail(
    Event,
    { id: eventId, isDeleted: false },
    ['owner']
  )
  if (!user.isAdmin && event.owner !== user)
    throw new Error('Must be owner or admin to delete event')
  event.isDeleted = true
  await em.persistAndFlush(event)
  await em
    .createQueryBuilder(EventUser)
    .update({ status: EventUserStatus.None })
    .where({ status: EventUserStatus.Joined, event })
    .execute()
  // liveQueryStore.invalidate(`Event:${eventId}`)
  return eventId
}

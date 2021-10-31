import { Field, ID, InputType } from 'type-graphql'
import { Context } from '@/types'
import {
  Event,
  EventUser,
  EventUserStatus,
  EventJobs,
  User
} from '@/entity'
import {logger} from "@/util";

@InputType()
export class SetUserJobInput {
  @Field(() => EventJobs)
  eventJob: EventJobs = EventJobs.Collaborator

  @Field(() => ID)
  eventId: string

  @Field(() => ID)
  userId: string
}

export async function setUserJob(
  { em, userId: currentUserId, liveQueryStore }: Context,
  { eventJob, eventId, userId }: SetUserJobInput
): Promise<EventUser> {
  logger('setUserJob')
  const currentUser = await em.findOneOrFail(User, currentUserId)
  const event = await em.findOneOrFail(Event, eventId, ['server', 'owner'])

  if (!currentUser.isAdmin && event.owner?.id !== currentUser.id) {
    const userJob = await em.findOneOrFail(EventUser, {
      user: currentUser.id,
      event: eventId,
      status: EventUserStatus.Joined
    }, ['user', 'event'])
    if (userJob.eventJob !== EventJobs.Moderator)
      throw new Error('Must be Owner or Moderator to set event Job')
  }

  const eventUser = await em.findOneOrFail(EventUser, {
    user: userId,
    event: eventId,
    status: EventUserStatus.Joined
  }, ['user', 'event'])
  if (eventUser.eventJob === eventJob) return eventUser
  eventUser.eventJob = eventJob
  await em.persistAndFlush(eventUser)
  liveQueryStore.invalidate(`Query.eventUsers(eventId:"${eventId}")`)
  return eventUser
}

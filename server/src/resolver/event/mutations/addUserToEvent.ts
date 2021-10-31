import { Field, ID, InputType } from 'type-graphql'
import { Context } from '@/types'
import {
  Event,
  EventUser,
  EventJobs,
  EventUserStatus,
  User
} from '@/entity'
import {logger, ReorderUtils} from '@/util'

@InputType()
export class AddUserToEventInput {
  @Field( ()=> ID)
  userId: string

  @Field( ()=> ID)
  eventId: string
}

export async function addUserToEvent(
  { em, userId: currentUserId, liveQueryStore }: Context,
  { userId, eventId }: AddUserToEventInput
  ): Promise<EventUser> {
    logger('addUserToEvent')
    const currentUser = await em.findOneOrFail(User, currentUserId)
    const user = await em.findOneOrFail(User, userId)
    let event = await em.findOneOrFail(Event, eventId, ['server', 'owner'])

    if (!currentUser.isAdmin && event.owner?.id !== currentUser.id) {
      const userJob = await em.findOneOrFail(EventUser, {
        user: currentUser.id,
        event: eventId,
        status: EventUserStatus.Joined
      }, ['user', 'event'])
      if (userJob.eventJob !== EventJobs.Moderator)
        throw new Error('Must be Owner or Moderator to set event Job')
    }

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

    return eventUser
}
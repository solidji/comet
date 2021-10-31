import { Field, ID, InputType } from 'type-graphql'
import { Length } from 'class-validator'
import { Event, User, EventUser, EventJobs } from '@/entity'
import { FileUpload, GraphQLUpload } from 'graphql-upload'
import { Context } from '@/types'
import {logger, uploadImageFileSingle} from '@/util'

@InputType()
export class UpdateEventInput {
  @Field(() => ID)
  eventId: string

  @Field()
  @Length(1, 300, { message: 'Title must be no longer than 300 characters.' })
  title?: string

  @Field({ nullable: true })
  @Length(0, 500)
  description?: string

  @Field(() => GraphQLUpload, { nullable: true })
  bannerFile?: FileUpload

  // @Field(() => ID, { nullable: true })
  // ownerId?: string
}

export async function updateEvent(
  { em, userId: currentUserId, liveQueryStore }: Context,
  {
    eventId,
    title,
    description,
    bannerFile,
    // ownerId,
  }: UpdateEventInput
): Promise<Event> {
  logger('updateEvent')
  title = title.trim()
  description = description.trim()
  const currentUser = await em.findOneOrFail(User, currentUserId)
  const event = await em.findOneOrFail(Event, eventId, ['owner'])

  if (!currentUser.isAdmin && event.owner !== currentUser) {
    const userJob = await em.findOneOrFail(EventUser, {
      user: currentUser.id,
      event: eventId
    }, ['user', 'event'])
    if (userJob.eventJob !== EventJobs.Moderator)
      throw new Error('Must be Owner or Moderator to set event Job')
  }

  // if (ownerId && event.owner !== currentUser)
  //   throw new Error('Must be event owner to change owner')
  // const owner = await em.findOneOrFail(User, ownerId)
  em.assign(event, {
    title: title ?? event.title,
    description: description ?? event.description,
    bannerUrl: bannerFile
      ? await uploadImageFileSingle(bannerFile, { width: 920, height: 540 })
      : event.bannerUrl,
    // owner: owner
  })
  await em.persistAndFlush(event)
  liveQueryStore.invalidate(`Event:${eventId}`)
  return event
}

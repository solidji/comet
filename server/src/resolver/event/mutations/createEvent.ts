import { Field, ID, InputType } from "type-graphql"
import { Length, Matches } from 'class-validator'
import { FileUpload, GraphQLUpload } from 'graphql-upload'
import { Context } from '@/types'
import {
  Event,
  EventJobs,
  EventUser,
  Message,
  User,
  Server,
  EventUserStatus
} from '@/entity'
import {handleUnderscore, logger, ReorderUtils, uploadImageFileSingle} from '@/util'

@InputType()
export class CreateEventInput {
  @Field()
  @Length(1, 300, { message: 'Title must be no longer than 300 characters.' })
  title: string

  @Field({ nullable: true })
  @Length(0, 500)
  description?: string

  @Field(() => GraphQLUpload, { nullable: true })
  bannerFile?: FileUpload

  @Field(() => ID)
  serverId: string

}

export async function createEvent(
  { em, userId, liveQueryStore }: Context,
  { title, description, bannerFile, serverId }: CreateEventInput
): Promise<Event> {
  logger('createEvent')

  const ownerCount = await em.count(Server, { owner: userId })
  if (ownerCount >= 10) throw new Error('Cannot own more than 10 planets')

  title = title.trim()
  description = description.trim()

  let bannerUrl = null
  if (bannerFile) {
    bannerUrl = await uploadImageFileSingle(
      bannerFile,
      {
        width: 1920,
        height: 1080
      },
      true
    )
  }

  const foundEvent = await em.findOne(Event, {
    title: handleUnderscore(title),
    isDeleted: false
  })
  if (foundEvent) throw new Error('Event with that title already exists')


  const server = await em.findOneOrFail(Server, serverId, { isDeleted: false })
  const user = await em.findOneOrFail(User, userId)
  await user.checkBannedFromServer(em, server.id)

  const event = em.create(Event, {
    title,
    description,
    owner: userId,
    server,
    bannerUrl,
    userCount: 1
  })

  // const channel = em.create(Channel, {
  //   name: 'general',
  //   server,
  //   isDefault: true
  // })

  const firstUser = await em.findOne(
    EventUser,
    { user: userId },
    { orderBy: { position: 'ASC' } }
  )
  const eventUser = em.create(EventUser, {
    event,
    user: userId,
    eventJob: EventJobs.Moderator,
    status: EventUserStatus.Joined,
    position: firstUser
      ? ReorderUtils.positionBefore(firstUser.position)
      : ReorderUtils.FIRST_POSITION
  })
  // const role = em.create(Role, {
  //   server,
  //   name: 'Default',
  //   isDefault: true,
  //   permissions: defaultServerPermissions,
  //   serverUsers: [serverUser]
  // })

  // const initialMessage = em.create(Message, {
  //   author: userId,
  //   type: MessageType.Initial,
  //   channel
  // })

  await em.persistAndFlush([
    event,
    eventUser
  ])
  // liveQueryStore.invalidate(`Server:${serverId}`)
  return event
}
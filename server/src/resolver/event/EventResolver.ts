import {
  Arg,
  Args,
  Authorized,
  Ctx,
  FieldResolver,
  ID,
  Mutation,
  Query,
  Resolver,
  Root
} from 'type-graphql'
import {
  Event,
  EventUser
} from '@/entity'
import { Context } from '@/types'
import {
  event,
  events,
  EventsArgs,
  EventsResponse,
  eventUsers
} from './queries'
import {
  createEvent,
  CreateEventInput,
  updateEvent,
  UpdateEventInput,
  deleteEvent, 
  DeleteEventInput,
  joinEvent,
  JoinEventInput,
  leaveEvent,
  LeaveEventInput,
  setUserJob,
  SetUserJobInput,
  addUserToEvent,
  AddUserToEventInput
} from './mutations'
import { GraphQLNonNegativeInt, GraphQLVoid } from 'graphql-scalars'
import { ChangePayload, SubscriptionTopic } from '@/resolver/subscriptions'
import { PubSub } from 'type-graphql/dist/decorators/PubSub'
import { Publisher } from 'type-graphql/dist/interfaces/Publisher'

@Resolver(() => Event)
export class EventResolver {
  // @FieldResolver(() => [Role])
  // async roles(
  //   @Ctx() { loaders: { serverRolesLoader } }: Context,
  //   @Root() server: Server
  // ): Promise<Role[]> {
  //   return serverRolesLoader.load(server.id)
  // }

  // @FieldResolver(() => [ServerPermission])
  // async permissions(
  //   @Ctx() { loaders: { serverPermissionsLoader } }: Context,
  //   @Root() server: Server
  // ): Promise<ServerPermission[]> {
  //   return serverPermissionsLoader.load(server.id)
  // }

  // @FieldResolver(() => GraphQLNonNegativeInt)
  // async onlineCount(
  //   @Ctx() { loaders: { serverOnlineCountLoader } }: Context,
  //   @Root() server: Server
  // ): Promise<number> {
  //   return serverOnlineCountLoader.load(server.id)
  // }

  @FieldResolver(() => Boolean)
  async isJoined(
    @Ctx() { loaders: { eventJoinedLoader } }: Context,
    @Root() event: Event
  ): Promise<boolean> {
    return eventJoinedLoader.load(event.id)
  }

  // --- Queries ---
  @Query(() => EventsResponse)
  async events(
    @Ctx() ctx: Context,
    @Args()
    args: EventsArgs
  ): Promise<EventsResponse> {
    return events(ctx, args)
  }

  @Query(() => Event)
  async event(
    @Ctx() ctx: Context,
    @Arg('id', () => ID)
    id: string
  ): Promise<Event> {
    return event(ctx, id)
  }

  @Query(() => [EventUser])
  async eventUsers(
    @Ctx() ctx: Context,
    @Arg('eventId', () => ID) eventId: string
  ): Promise<EventUser[]> {
    return eventUsers(ctx, eventId)
  }

  // --- Mutations ---
  @Authorized()
  @Mutation(() => Event)
  async createEvent(
    @Ctx() ctx: Context,
    @Arg('input') input: CreateEventInput
  ): Promise<Event> {
    return createEvent(ctx, input)
  }

  @Authorized()
  @Mutation(() => Event)
  async updateEvent(
    @Ctx() ctx: Context,
    @Arg('input') input: UpdateEventInput
  ): Promise<Event> {
    return updateEvent(ctx, input)
  }

  @Authorized()
  @Mutation(() => ID)
  async deleteEvent(
    @Ctx() ctx: Context,
    @Arg('input') input: DeleteEventInput
  ): Promise<string> {
    return deleteEvent(ctx, input)
  }

  @Authorized()
  @Mutation(() => Event)
  async joinEvent(
    @Ctx() ctx: Context,
    @Arg('input') input: JoinEventInput,
    @PubSub(SubscriptionTopic.EventChanged)
    notifyEventChanged: Publisher<ChangePayload>
  ): Promise<Event> {
    return joinEvent(ctx, input, notifyEventChanged)
  }

  @Authorized()
  @Mutation(() => Event)
  async leaveEvent(
    @Ctx() ctx: Context,
    @Arg('input') input: LeaveEventInput
  ): Promise<Event> {
    return leaveEvent(ctx, input)
  }

  @Authorized()
  @Mutation(() => EventUser)
  async setUserJob(
    @Ctx() ctx: Context,
    @Arg('input') input: SetUserJobInput
  ): Promise<EventUser> {
    return setUserJob(ctx, input)
  }
  
  @Authorized()
  @Mutation(() => EventUser)
  async addUserToEvent(
    @Ctx() ctx: Context,
    @Arg('input') input: AddUserToEventInput
  ): Promise<EventUser> {
    return addUserToEvent(ctx, input)
  }

  // @Authorized()
  // @Mutation(() => Boolean)
  // async kickUserFromServer(
  //   @Ctx() ctx: Context,
  //   @Arg('input') input: KickUserFromServerInput
  // ): Promise<boolean> {
  //   return kickUserFromServer(ctx, input)
  // }
}

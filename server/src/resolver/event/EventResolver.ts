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
  Server,
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
  CreateEventInput
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

  // @FieldResolver(() => Boolean)
  // async isJoined(
  //   @Ctx() { loaders: { serverJoinedLoader } }: Context,
  //   @Root() server: Server
  // ): Promise<boolean> {
  //   return serverJoinedLoader.load(server.id)
  // }

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

  // @Authorized()
  // @Mutation(() => Server)
  // async updateServer(
  //   @Ctx() ctx: Context,
  //   @Arg('input') input: UpdateServerInput
  // ): Promise<Server> {
  //   return updateServer(ctx, input)
  // }

  // @Authorized()
  // @Mutation(() => ID)
  // async deleteServer(
  //   @Ctx() ctx: Context,
  //   @Arg('input') input: DeleteServerInput
  // ): Promise<string> {
  //   return deleteServer(ctx, input)
  // }

  // @Authorized()
  // @Mutation(() => Server)
  // async joinServer(
  //   @Ctx() ctx: Context,
  //   @Arg('input') input: JoinServerInput,
  //   @PubSub(SubscriptionTopic.MessageChanged)
  //   notifyMessageChanged: Publisher<ChangePayload>
  // ): Promise<Server> {
  //   return joinServer(ctx, input, notifyMessageChanged)
  // }

  // @Authorized()
  // @Mutation(() => Server)
  // async leaveServer(
  //   @Ctx() ctx: Context,
  //   @Arg('input') input: LeaveServerInput
  // ): Promise<Server> {
  //   return leaveServer(ctx, input)
  // }

  // @Authorized()
  // @Mutation(() => Boolean)
  // async kickUserFromServer(
  //   @Ctx() ctx: Context,
  //   @Arg('input') input: KickUserFromServerInput
  // ): Promise<boolean> {
  //   return kickUserFromServer(ctx, input)
  // }
  
  // @Authorized()
  // @Mutation(() => Boolean)
  // async addUserToServer(
  //   @Ctx() ctx: Context,
  //   @Arg('input') input: AddUserToServerInput
  // ): Promise<boolean> {
  //   return addUserToServer(ctx, input)
  // }
}

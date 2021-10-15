import { ArgsType, Field, ID, ObjectType, registerEnumType } from 'type-graphql'
import { Context } from '@/types'
import { Server, Event, User } from '@/entity'
import {logger} from "@/util";
import { Max, Min } from 'class-validator'
import { GraphQLNonNegativeInt, GraphQLPositiveInt } from 'graphql-scalars';
import { QueryOrder } from '@mikro-orm/core';

@ArgsType()
export class EventsArgs {
  @Field(() => GraphQLNonNegativeInt, { defaultValue: 0 })
  @Min(0)
  offset: number = 0

  @Field(() => GraphQLPositiveInt, { defaultValue: 20 })
  @Min(1)
  @Max(100)
  limit: number = 20

  @Field(() => EventsSort, {
    defaultValue: 'New'
  })
  sort: EventsSort = EventsSort.New

  @Field(() => EventsTime, {
    defaultValue: 'All'
  })
  time: EventsTime = EventsTime.All

  @Field(() => ID, {
    nullable: true
  })
  serverId?: string

  @Field({
    nullable: true
  })
  search?: string
}

export enum EventsSort {
  New = 'New',
  Top = 'Top',
  Hot = 'Hot',
  Added = 'Added'
}

registerEnumType(EventsSort, {
  name: 'EventsSort'
})

export enum EventsTime {
  Hour = 'Hour',
  Day = 'Day',
  Week = 'Week',
  Month = 'Month',
  Year = 'Year',
  All = 'All'
}

registerEnumType(EventsTime, {
  name: 'EventsTime'
})

@ObjectType()
export class EventsResponse {
  @Field()
  hasMore: boolean

  @Field(() => [Event])
  events: Event[]
}

export async function events(
  { em , userId }: Context,
  { offset, limit, sort, time, serverId, search }: EventsArgs
): Promise<EventsResponse> {
  logger('events')
  const user = userId ? await em.findOneOrFail(User, userId) : null
  let orderBy = {}
  if (sort === EventsSort.New) orderBy = { createdAt: QueryOrder.DESC }
  else if (sort === EventsSort.Hot) orderBy = { hotRank: QueryOrder.DESC }
  else if (sort === EventsSort.Top) orderBy = { voteCount: QueryOrder.DESC }

  let servers: Server[] = []

  if (serverId) {
    servers = [await em.findOneOrFail(Server, { id: serverId, isDeleted: false })]
  }

  const events = await em.find(
    Event,
    {
      $and: [
        { isDeleted: false },
        !time || time === EventsTime.All
          ? {}
          : {
              createdAt: {
                // @ts-ignore
                $gt: dayjs().subtract(1, time.toLowerCase()).toDate()
              }
            },
        servers.length ? { server: servers } : {}
      ]
    },
    ['owner', 'server'],
    orderBy,
    limit + 1,
    offset
  )
  const hasMore = events.length > limit
  return {
    hasMore,
    events: hasMore ? events.slice(0, limit) : events
  } as EventsResponse
}
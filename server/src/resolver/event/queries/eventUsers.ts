import { EventUser, EventUserStatus } from '@/entity'
import { Context } from '@/types'
import {logger} from "@/util";

export async function eventUsers(
  { em }: Context,
  eventId: string
): Promise<EventUser[]> {
  logger('eventUsers')
  em = em.fork()
  return em.find(
    EventUser,
    {
      event: eventId,
      status: EventUserStatus.Joined
    },
    ['user'],
    { user: { username: 'ASC' } }
  )
}

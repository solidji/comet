import { Event } from '@/entity'
import { Context } from '@/types'
import {logger} from "@/util";

export async function event({ em }: Context, id: string): Promise<Event> {
  logger('event')
  const event = await em.findOneOrFail(Event, id, ['server', 'owner'])
  return event
}

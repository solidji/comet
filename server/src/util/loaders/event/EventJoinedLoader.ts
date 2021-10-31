import { EntityManager } from '@mikro-orm/postgresql'
import { Event, EventUser, EventUserStatus } from '@/entity'
import DataLoader from 'dataloader'
import {logger} from "@/util";

export const eventJoinedLoader = (em: EntityManager, userId: string) => {
  const loader = new DataLoader<string, boolean>(
    async (eventIds: string[]) => {
      logger('eventJoinedLoader', eventIds)
      loader.clearAll()
      if (!userId) return eventIds.map(_ => false)
      const eventUsers = await em.find(EventUser, {
        event: eventIds,
        user: userId,
        status: EventUserStatus.Joined
      })
      const map: Record<string, boolean> = {}
      eventIds.forEach(
        eventId =>
          (map[eventId] = !!eventUsers.find(
            su => su.event === em.getReference(Event, eventId)
          ))
      )
      return eventIds.map(eventId => map[eventId])
    }
  )
  return loader
}

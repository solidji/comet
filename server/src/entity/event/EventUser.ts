import {
  Entity,
  Enum,
  ManyToOne,
  PrimaryKeyType,
  Property
} from '@mikro-orm/core'
import { EventJobs, Event, User, ServerUserStatus } from '@/entity'
import { ReorderUtils } from '@/util/ReorderUtils'
import { Field, ID, ObjectType } from 'type-graphql'

@ObjectType()
@Entity()
export class EventUser {
  @Field(() => User)
  @ManyToOne({ entity: () => User, primary: true })
  user: User

  @ManyToOne({ entity: () => Event, primary: true })
  event: Event;

  [PrimaryKeyType]: [string, string]

  @Property({ columnType: 'text' })
  position: string = ReorderUtils.FIRST_POSITION

  @Property()
  createdAt: Date = new Date()

  @Field(() => EventJobs)
  @Enum({items: () => EventJobs})
  eventJob: EventJobs = EventJobs.None

  // @Enum({
  //   items: () => ServerUserStatus
  // })
  // status: ServerUserStatus = ServerUserStatus.Joined

  @Field(() => ID)
  get id() {
    return `u${this.user.id}-e${this.event.id}`
  }
}

import { Field, ObjectType } from 'type-graphql'
import { BaseEntity } from '@/entity/BaseEntity'
import { Collection, Entity, ManyToOne, OneToMany, Property, QueryOrder, Embedded } from '@mikro-orm/core'
import { User, EventUser, Server, Image } from '@/entity'
import { GraphQLNonNegativeInt } from 'graphql-scalars'

@ObjectType({ implements: BaseEntity})
@Entity()
export class Event extends BaseEntity {

  @Field()
  @Property({ columnType: 'text' })
  title: string
  
  @Field({ nullable: true })
  @Property({ nullable: true, columnType: 'text' })
  description?: string

  @Field(() => User)
  @ManyToOne(() => User)
  owner: User

  // @Field(() => [EventUser])
  @OneToMany(() => EventUser, 'event', {
    orderBy: { position: QueryOrder.ASC }
  })
  userJoins = new Collection<EventUser>(this)
  
  // @OneToMany(() => Condition, 'event', {
  //   orderBy: { position: QueryOrder.ASC }
  // })
  // conditions = new Collection<Condition>(this)

  // @Field(() => [Image])
  // @Embedded(() => Image, { object: true, array: true })
  // document: Image[] = []

  @Field(() => [Image])
  @Embedded(() => Image, { object: true, array: true })
  images: Image[] = []

  @Field({ nullable: true })
  @Property({ nullable: true, columnType: 'text' })
  bannerUrl?: string

  @Field()
  @Property()
  isDeleted: boolean = false

  @Field()
  @Property()
  isPublic: boolean = true

  @Field()
  isJoined: boolean

  @Field(() => Server)
  @ManyToOne({ entity: () => Server })
  server: Server

  @Field(() => GraphQLNonNegativeInt)
  @Property({ unsigned: true })
  userCount: number = 0
  
  @Field()
  get relativeUrl(): string {
    const slug = this.title
      .toLowerCase()
      .trim()
      .split(' ')
      .slice(0, 9)
      .join('_')
      .replace(/[^a-z0-9_\u4e00-\u9fa5]+/gi, '')
      .replace(/[_](.)\1+/g, '$1')
    return `/+${this.server.name}/event/${this.id}/${slug}`
  }

  @Field({ nullable: true })
  @Property({ nullable: true })
  updatedAt?: Date
}
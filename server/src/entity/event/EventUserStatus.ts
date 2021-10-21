import { registerEnumType } from 'type-graphql'

export enum EventUserStatus {
  None = 'None',
  Joined = 'Joined',
  Banned = 'Banned'
}

registerEnumType(EventUserStatus, { name: 'EventUserStatus' })

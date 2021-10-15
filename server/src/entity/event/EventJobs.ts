import { registerEnumType } from 'type-graphql'

export enum EventJobs{
  None = 'None',
  Moderator = 'Moderator',
  Collaborator = 'Collaborator'
}

registerEnumType(EventJobs, { name: 'EventJobs' })

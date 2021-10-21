import { registerEnumType } from 'type-graphql'

export enum EventJobs{
  None = 'None',
  Member = 'Member',
  Moderator = 'Moderator',
  Collaborator = 'Collaborator'
}

registerEnumType(EventJobs, { name: 'EventJobs' })

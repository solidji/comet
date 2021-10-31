import { useState } from 'react'
import { useStore } from '@/hooks/useStore'
import { useEventsQuery } from '@/graphql/hooks'
import { useCurrentUser } from "@/hooks/graphql/useCurrentUser";

export const useEvents = ({ serverId }) => {
  const [currentUser] = useCurrentUser()
  const [postsSort, postsTime ] = useStore(s => [
    s.postsSort,
    s.postsTime,
  ])
  const variables = {
    sort: postsSort,
    time: postsSort === 'Top' ? postsTime : null,
    serverId
  }
  const { data, loading, fetchMore } = useEventsQuery({
    variables,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first'
  })
  const hasMore = data?.events.hasMore
  const events = data?.events.events ?? []
  const loadMore = () => {
    if (!hasMore || events.length === 0) return
    fetchMore({
      variables: {
        ...variables,
        offset: events.length
      },
    })
  }
  return [events, loading, loadMore, hasMore]
}

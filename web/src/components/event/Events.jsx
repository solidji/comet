import { VirtuosoGrid } from 'react-virtuoso'
import { useEvents } from '@/components/event/useEvents'
import { useStore } from '@/hooks/useStore'
import Post from '@/components/post/Post'
import EventInfoCard from '@/components/event/EventInfoCard'
import { IconSpinner } from '@/components/ui/icons/IconSpinner'
import { useCallback, useRef } from 'react'
import EndReached from '@/components/ui/EndReached'
import CreateEventHeader from '@/components/event/CreateEventHeader'
import { useCurrentUser } from '@/hooks/graphql/useCurrentUser'

export default function Events({ serverId, header }) {
  const virtuoso = useRef(null)
  const [currentUser] = useCurrentUser()
  const [events, fetching, fetchMore, hasMore] = useEvents({ serverId })

  const postRenderer = useCallback((postsList, index) => {
    const event = postsList[index]
    if (!event) return <div style={{ height: '1px' }} /> // returning null or zero height breaks the virtuoso
    return (
      // <div className="md:px-4 pb-1.5 px-0">
      <EventInfoCard event={event} key={index} />
      //</div>
    )
  }, [])

  return (
    <div className="relative h-full max-h-full px-2 py-2 md:px-4 md:py-4 dark:bg-gray-750">
      {currentUser ? (
        <CreateEventHeader serverId={serverId} />
      ) : (
        <div className="h-4" />
      )}
      {hasMore ? (
        fetching ? (
          <IconSpinner />
        ) : (
          <div className="flex items-center justify-center h-20">
            <button onClick={fetchMore}>press to load more</button>
          </div>
        )
      ) : (
        events?.length == 0 && <EndReached>No more events loaded!</EndReached>
      )}
      <VirtuosoGrid
        className="bg-gray-100 rounded-lg dark:bg-gray-750 scrollbar-none"
        itemClassName="rounded-lg"
        listClassName=" grid grid-cols-1 gap-4 lg:grid-cols-3 2xl:grid-cols-5"
        // components={{
        //   // EmptyPlaceholder: ()=><EndReached />,
        //   Header: header ? () => header : null,
        //   Footer: () =>
        //     hasMore ? (
        //       <div className="flex items-center justify-center h-20">
        //         <IconSpinner />
        //       </div>
        //     ) : (
        //       <EndReached />
        //     )
        // }}
        endReached={() => {
          console.log('🚀 ~ file: Events.jsx ~ line 54 ~ Events ~ endReached')
          if (!fetching && hasMore) {
            fetchMore()
          }
        }}
        itemContent={i => postRenderer(events, i)}
        overscan={100}
        ref={virtuoso}
        style={{ overflowX: 'hidden' }}
        totalCount={events?.length || 0}
      />
    </div>
  )
}

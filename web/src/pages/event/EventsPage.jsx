import { useState } from 'react'
import EventInfoCard from '@/components/event/EventInfoCard'
import Events from '@/components/event/Events'
import CreateEventHeader from '@/components/event/CreateEventHeader'
import { useStore } from '@/hooks/useStore'
import { useCurrentUser } from "@/hooks/graphql/useCurrentUser";
import Page from '@/components/ui/page/Page'
import PageView from '@/components/ui/page/PageView'
import { useSetServerPage } from '@/hooks/useSetServerPage'
import { usePublicServersQuery, useEventsQuery } from '@/graphql/hooks'
import EndReached from '@/components/ui/EndReached'
import { Helmet } from 'react-helmet-async'
import Header from "@/components/ui/header/Header";
import {IconExplore} from "@/components/ui/icons/Icons";
import { useCurrentServer } from '@/hooks/graphql/useCurrentServer'

export default function EventsPage() {
  const { server, users: serverUsers } = useCurrentServer()
  const [currentUser] = useCurrentUser()

  // useSetServerPage(``)

  // const [postsSort, postsTime] = useStore(s => [
  //   s.postsSort,
  //   s.postsTime
  // ])
  // const variables = {
  //   sort: postsSort,
  //   time: postsSort === 'Top' ? postsTime : null,
  //   serverId: server?.id
  // }
  
  // const { data, loading, fetchMore } = useEventsQuery({
  //   variables,
  //   fetchPolicy: 'cache-and-network',
  //   nextFetchPolicy: 'cache-first'
  // })

  // const events = data?.events?.events ?? []

  return (
    <Page 
    header={<Header title="Events" icon={<IconExplore className="w-5 h-5" />} />}
    // header={currentUser ? <CreateEventHeader server={server} /> : <div className="h-4" />}
    >
      <Helmet>
        <title>{server?.displayName}</title>
      </Helmet>
      {/* <PageView> */}
        {/* <div className="px-0 py-0 md:px-8 md:py-8">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 2xl:grid-cols-5">
            {events?.map(event => (
              <EventInfoCard event={event} key={event.id} />
            ))}
          </div>
          {!events.length && <EndReached>Nothing here yet!</EndReached>}
        </div> */}
      <Events
        serverId={server?.id}
        header={currentUser ? <CreateEventHeader server={server} /> : <div className="h-4" />}
      />
      {/* </PageView>  */}
    </Page>
  )
}

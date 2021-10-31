import { useTranslation } from 'react-i18next'
import ContextMenuSection from '@/components/ui/context/ContextMenuSection'
import {
  CurrentUserDocument,
  PublicServersDocument,
  EventFragmentDoc,
  useFeatureServerMutation,
  useLeaveServerMutation,
  useUnfeatureServerMutation
} from '@/graphql/hooks'
import { useApolloClient } from '@apollo/client'
import { useHistory, useLocation } from 'react-router-dom'
import { useCurrentUser } from '@/hooks/graphql/useCurrentUser'
import { useStore } from '@/hooks/useStore'

export default function EventContextMenu({
  event,
  openDelete,
  ContextMenuItem
}) {
  const { t } = useTranslation()
  const [currentUser] = useCurrentUser()
  const apolloClient = useApolloClient()
  const [leaveServer] = useLeaveServerMutation()
  const { push } = useHistory()
  const { pathname } = useLocation()
  const sort = useStore(s => s.exploreSort)
  const refetchQueries = [
    {
      query: PublicServersDocument,
      variables: {
        sort
      }
    }
  ]
  // const [featureServer] = useFeatureServerMutation({
  //   refetchQueries
  // })
  // const [unfeatureServer] = useUnfeatureServerMutation({
  //   refetchQueries
  // })

  return (
    <>
      <ContextMenuSection>
        {/* {currentUser?.isAdmin && (
          <>
            {!!enableFeatured && (
              <ContextMenuItem
                label={
                  server.isFeatured ? 'Remove from Featured' : 'Make Featured'
                }
                onClick={() => {
                  if (server.isFeatured) {
                    unfeatureServer({
                      variables: { input: { serverId: server.id } }
                    })
                  } else {
                    featureServer({
                      variables: { input: { serverId: server.id } }
                    })
                  }
                }}
              />
            )}
          </>
        )} */}
        {!!currentUser && !!event.owner && event.owner.id !== currentUser.id && (
          <ContextMenuItem
            // label={t('server.context.leave')}
            label={'取消报名'}
            red
            onClick={() => {
              if (pathname.startsWith(`/+${event.id}`)) push('/')
              // leaveEvent({ variables: { input: { serverId: event.id } } })
              const data = apolloClient.cache.readQuery({
                query: CurrentUserDocument
              })
              apolloClient.cache.writeQuery({
                query: CurrentUserDocument,
                data: {
                  user: {
                    ...data.user,
                    // servers: data.user.servers.filter(s => s.id !== event.id)
                  }
                }
              })
              const frag = apolloClient.cache.readFragment({
                fragment: EventFragmentDoc,
                id: `Event:${event.id}`
              })
              apolloClient.cache.writeFragment({
                fragment: EventFragmentDoc,
                id: `Event:${event.id}`,
                data: { ...frag, isJoined: false }
              })
            }}
          />
        )}
        {!!currentUser && !!event.owner &&
          !!openDelete &&
          (currentUser.isAdmin || event.owner.id === currentUser.id) && (
            <ContextMenuItem
              label="Delete Event"
              red
              onClick={() => openDelete()}
            />
          )}
      </ContextMenuSection>
    </>
  )
}

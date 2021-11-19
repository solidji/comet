import { useTranslation } from 'react-i18next'
import ContextMenuSection from '@/components/ui/context/ContextMenuSection'
import {
  CurrentUserDocument,
  PublicServersDocument,
  EventFragmentDoc,
  EventDocument,
  EventsDocument,
  // useUnfeatureServerMutation,
  // useFeatureServerMutation,
  useLeaveEventMutation,
  useDeleteEventMutation
} from '@/graphql/hooks'
import { useApolloClient } from '@apollo/client'
import { useHistory, useLocation } from 'react-router-dom'
import { useCurrentUser } from '@/hooks/graphql/useCurrentUser'
import { useState } from 'react'
import { useStore } from '@/hooks/useStore'
import StyledDialog from '@/components/ui/dialog/StyledDialog'
import CreateEventDialog from '@/components/event/CreateEventDialog'
import { IconExplore, IconHome, IconSpinner } from '@/components/ui/icons/Icons'

export default function EventContextMenu({
  event,
  openDelete,
  ContextMenuItem
}) {
  const { t } = useTranslation()
  const [currentUser] = useCurrentUser()
  const apolloClient = useApolloClient()
  const [leaveEvent] = useLeaveEventMutation()
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
  const isOwner =
    !!event.owner && !!currentUser && event.owner.id === currentUser.id
  const canDelete = isOwner || currentUser.isAdmin
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  return (
    <>
      <DeleteEventDialog
        open={deleteOpen}
        setOpen={setDeleteOpen}
        event={event}
      />
      <CreateEventDialog
        open={editOpen}
        setOpen={setEditOpen}
        serverId={event.server.id}
        event={event}
      />
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
                    ...data.user
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
        {isOwner && (
          <ContextMenuItem
            label={t('event.context.edit')}
            onClick={() => setEditOpen(true)}
          />
        )}
        {canDelete && (
          <ContextMenuItem
            label={t('event.context.delete')}
            red
            onClick={() => setDeleteOpen(true)}
          />
        )}
      </ContextMenuSection>
    </>
  )
}

function DeleteEventDialog({ open, setOpen, event }) {
  const { push } = useHistory()
  const [postsSort, postsTime] = useStore(s => [s.postsSort, s.postsTime])
  const variables = {
    sort: postsSort,
    time: postsSort === 'Top' ? postsTime : null,
    serverId: event.server.id
  }

  const [deleteEvent, { loading }] = useDeleteEventMutation({
    update(cache, { data: { deleteEvent } }) {
      const data = cache.readQuery({
        query: EventsDocument,
        variables
      })
      cache.writeQuery({
        query: EventsDocument,
        variables,
        data: {
          events: {
            ...data.events,
            events: data.events.events.filter(c => c.id !== deleteEvent)
          }
        }
      })
    }
  })

  return (
    <StyledDialog
      open={open}
      close={() => setOpen(false)}
      closeOnOverlayClick
      small
      buttons={
        <>
          <button
            className="form-button-cancel"
            type="button"
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
          <button
            className="form-button-delete"
            type="button"
            onClick={() => {
              deleteEvent({
                variables: { input: { eventId: event.id } }
              }).then(() => {
                setOpen(false)
                push(`/+${event.server.name}/event`)
              })
            }}
          >
            Delete
            {loading && <IconSpinner className="w-5 h-5 ml-3 text-primary" />}
          </button>
        </>
      }
    >
      <div className="w-full max-w-md px-5 pt-5 pb-10 rounded-md dark:bg-gray-800">
        <div className="text-lg font-semibold text-red-400">
          Delete {event.title}
        </div>

        <div className="pt-3 pb-3 text-sm text-tertiary">
          所有活动相关文档、相册、评论都会被一并删除，请仔细确认。
        </div>
      </div>
    </StyledDialog>
  )
}

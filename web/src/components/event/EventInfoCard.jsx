import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import UserAvatar from '@/components/user/UserAvatar'
import ServerAvatar from '@/components/server/ServerAvatar'
import { useCurrentUser } from '@/hooks/graphql/useCurrentUser'
import { Link } from 'react-router-dom'
import { IconUsers } from '@/components/ui/icons/Icons'
import ContextMenuTrigger from '@/components/ui/context/ContextMenuTrigger'
import { ContextMenuType } from '@/types/ContextMenuType'
import { useStore } from '@/hooks/useStore'

export default function EventInfoCard({
  event,
  shadow = false,
  className = ''
}) {
  const { t } = useTranslation()
  const [currentUser] = useCurrentUser()
  // const CategoryIcon = getCategoryIcon(event.category)
  // const exploreCategory = useStore(s => s.exploreCategory)
  const [deleteOpen, setDeleteOpen] = useState(false)
  return (
    <ContextMenuTrigger
      data={{
        type: ContextMenuType.Event,
        event,
        openDelete: ()=> setDeleteOpen(true)
        // enableFeatured: true
      }}
    >
      <Link
        to={`/+${event.relativeUrl}`}
        className={`${className} relative flex flex-col w-full rounded-lg group dark:bg-gray-800 dark:hover:bg-gray-850 duration-200 transform transition hover:shadow-xl bg-white ${
          shadow ? 'shadow-lg' : ''
        }`}
      >
        <div
          className="relative w-full h-32 bg-center bg-no-repeat bg-cover rounded-t-lg bg-gradient-to-br from-red-400 to-indigo-600"
          style={
            event?.bannerUrl
              ? { backgroundImage: `url(${event?.bannerUrl})` }
              : undefined
          }
        >
          <div className="absolute left-4 -bottom-3">
            <UserAvatar
              size={10}
              user={event?.owner}
              // showOnline
              // dotClassName="w-2 h-2 ring-2 dark:ring-gray-800 ring-gray-50"
              className="transition bg-white dark:bg-gray-750 rounded-xl ring-4 dark:ring-gray-800 ring-white dark:group-hover:ring-gray-850 group-hover:shadow-md"
            />
          </div>
        </div>

        <div className="flex flex-col flex-grow h-40 px-4 pt-5 pb-4">
          <div className="text-lg font-semibold text-secondary">
            {event?.title}
          </div>

          <div className="pt-1 text-13 text-tertiary line-clamp-3">
            {event?.description || 'No description'}
          </div>

          <div className="flex mt-auto text-xs">
            <div className="inline-flex items-center">
              <IconUsers className="w-4 h-4 text-tertiary" />
              <div className="ml-2 text-tertiary">
                {t('event.memberCount', { count: event?.userCount ?? 0 })}
              </div>
            </div>

            <div className="inline-flex items-center ml-auto">
              {/* <CategoryIcon className="w-4 h-4 text-tertiary" /> */}
              {/* {!event?.isJoined && <div>报名</div>} */}
              {event?.isJoined && 
                <UserAvatar
                  user={currentUser}
                  size={5}
                  className="rounded-full dark:bg-gray-750"
                />
              }
              {/* {event?.isJoined && <div>已报名</div>} */}
              {/* <div className="ml-2 text-tertiary">{server.category}</div> */}
            </div>
          </div>
        </div>
      </Link>
    </ContextMenuTrigger>
  )
}

import { useTranslation } from 'react-i18next'
import { useCurrentUser } from '@/hooks/graphql/useCurrentUser'
import UserAvatar from '@/components/user/UserAvatar'
import { useState } from 'react'
import CreateEventDialog from '@/components/event/CreateEventDialog'

export default function CreateEventHeader({ serverId }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [user] = useCurrentUser()

  return (
    <>
      <CreateEventDialog open={open} setOpen={setOpen} serverId={serverId} />
      <div className="pb-2 md:pb-4">
        <div
          onClick={() => setOpen(true)}
          className="flex items-center transition bg-gray-200 rounded cursor-pointer dark:bg-gray-700 h-13 dark:hover:bg-gray-650 hover:bg-gray-300"
        >
          <div className="px-3 border-r border-gray-300 dark:border-gray-650 h-7">
            <UserAvatar user={user} size={7} />
          </div>
          <div className="px-3 text-sm text-secondary">
            {t('event.createEvent')}
          </div>
        </div>
      </div>
    </>
  )
}

import { useCurrentUser } from '@/hooks/graphql/useCurrentUser'
import UserAvatar from '@/components/user/UserAvatar'
import {
  IconBell,
  IconDark,
  IconDownload,
  IconLight,
  IconSettings,
  IconSearch,
  IconFolder
} from '@/components/ui/icons/Icons'
import Tippy from '@tippyjs/react'
import { useEffect, useState } from 'react'
import UserSettingsDialog from '@/components/user/UserSettingsDialog'
import { version } from '../../package.json'
import { useStore } from '@/hooks/useStore'
import { OnlineStatus, useChangeOnlineStatusMutation } from '@/graphql/hooks'
import { Link } from 'react-router-dom'
import { getDownloadLink } from '@/hooks/getDownloadLink'
import { useLoginDialog } from '@/hooks/useLoginDialog'
import { getOS } from '@/utils/getOS'
import { useDarkMode } from '@/hooks/useDarkMode'

export default function BottomBar() {
  const [currentUser] = useCurrentUser()
  const offset = [0, 14]
  const [open, setOpen] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useStore(s => [
    s.updateAvailable,
    s.setUpdateAvailable
  ])
  useEffect(() => {
    if (window.electron) {
      window.electron.on('updateAvailable', () => {
        setUpdateAvailable(true)
      })
    }
  }, [])

  const [changeOnlineStatus] = useChangeOnlineStatusMutation()

  // Update online status every 15 seconds
  useEffect(() => {
    if (currentUser) {
      const id = setInterval(() => {
        changeOnlineStatus({
          variables: {
            input: { onlineStatus: OnlineStatus.Online }
          }
        })
      }, 15000)
      return () => clearInterval(id)
    }
  }, [currentUser])

  const { toggle: toggleDark, value: isDark } = useDarkMode()

  const downloadLink = getDownloadLink()
  const os = getOS()
  const [loginOpen, setLoginOpen, isCreateAccount, setCreateAccount] =
    useLoginDialog()
  return (
    <>
      {!!currentUser && <UserSettingsDialog open={open} setOpen={setOpen} />}

      <div className="flex items-center shadow-md px-3 bottom-0 h-5.5 dark:bg-gray-700 z-50 bg-white">
        {currentUser ? (
          <>
            <UserAvatar size={4.5} className="mr-2" user={currentUser} />
            <div className="font-medium cursor-pointer text-primary text-13">
              {currentUser.username}
            </div>
            <div className="w-2 h-2 ml-2 bg-green-500 rounded-full" />
          </>
        ) : (
          <div className="flex items-center font-medium text-primary text-13">
            <div
              className="cursor-pointer hover:underline"
              onClick={() => {
                setCreateAccount(false)
                setLoginOpen(true)
              }}
            >
              Log In
            </div>
            &nbsp;&nbsp;&middot;&nbsp;&nbsp;
            <div
              className="cursor-pointer hover:underline"
              onClick={() => {
                setCreateAccount(true)
                setLoginOpen(true)
              }}
            >
              Create account
            </div>
          </div>
        )}

        <div className="flex items-center ml-auto space-x-4 text-primary">
          {os === 'Windows' && !window.electron && (
            <Tippy content="Download Comet for Desktop">
              <a
                className="block"
                target="_blank"
                rel="noopener noreferrer"
                href={downloadLink}
              >
                <IconDownload className="w-4.5 h-4.5 text-tertiary cursor-pointer" />
              </a>
            </Tippy>
          )}

          <Tippy content={isDark ? 'Light Mode' : 'Dark Mode'}>
            <button
              className="cursor-pointer text-tertiary"
              onClick={() => toggleDark()}
            >
              {isDark ? (
                <IconLight className="w-5 h-5" />
              ) : (
                <IconDark className="w-5 h-5" />
              )}
            </button>
          </Tippy>

          <Tippy
            content={`${
              window.electron && updateAvailable
                ? 'Update available'
                : 'Up to date!'
            }`}
          >
            <div
              className={`flex items-center ${
                window.electron && updateAvailable ? 'cursor-pointer' : ''
              }`}
              onClick={() => {
                if (window.electron && updateAvailable) {
                  window.electron.restart()
                }
              }}
            >
              <div
                className={`text-xs font-medium ${
                  updateAvailable && window.electron
                    ? 'text-green-500'
                    : 'text-tertiary'
                }`}
              >
                Fami+ v{version}
              </div>

              {window.electron && updateAvailable && (
                <div className="pl-2">
                  <IconDownload className="w-4.5 h-4.5 text-green-500 cursor-pointer" />
                </div>
              )}
            </div>
          </Tippy>

          {/* <Tippy content="Search" offset={offset}>
            <div>
              <IconSearch className="w-4.5 h-4.5 cursor-pointer" />
            </div>
          </Tippy>

          <Tippy content="Folders" offset={offset}>
            <div>
              <IconFolder className="w-4.5 h-4.5 cursor-pointer" />
            </div>
          </Tippy> */}

          {!!currentUser && (
            <>
              <Tippy content="Notifications" offset={offset}>
                <Link to="/inbox">
                  <IconBell className="w-4.5 h-4.5 cursor-pointer text-tertiary" />
                </Link>
              </Tippy>

              <Tippy content="Settings" offset={offset}>
                <div onClick={() => setOpen(true)}>
                  <IconSettings className="w-4.5 h-4.5 cursor-pointer text-tertiary" />
                </div>
              </Tippy>
            </>
          )}
        </div>
      </div>
    </>
  )
}

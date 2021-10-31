import { useHistory, useLocation, useParams } from 'react-router-dom'
import { IconHot, IconNew, IconTop } from '@/components/ui/icons/Icons'

import SidebarItem from '@/components/ui/sidebar/SidebarItem'
import { useStore } from '@/hooks/useStore'
import { useTranslation } from 'react-i18next'

function SortItem({ name, icon }) {
  const [postsSort, setPostsSort] = useStore(s => [s.postsSort, s.setPostsSort])
  const { server } = useParams()

  const { pathname } = useLocation()

  const { push } = useHistory()

  const active =
    postsSort === name && (pathname === '/' || pathname === `/${server}/event`)

  const Icon = icon

  return (
    <SidebarItem
      onClick={() => {
        setPostsSort(name)
        push(server ? `/${server}/event` : '/')
      }}
      active={active}
    >
      <Icon className="w-5 h-5 mr-3 text-tertiary" />
      {name}
    </SidebarItem>
  )
}

export default function SidebarSortEvents() {
  const { t } = useTranslation()
  return (
    <div className="space-y-0.5">
      <SortItem name={t('post.feed.sort.hot')} icon={IconHot} />
      <SortItem name={t('post.feed.sort.new')} icon={IconNew} />
      <SortItem name={t('post.feed.sort.top')} icon={IconTop} />
    </div>
  )
}

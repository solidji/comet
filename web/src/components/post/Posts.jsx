import { Virtuoso } from 'react-virtuoso'
import { usePosts } from '@/components/post/usePosts'
import Post from '@/components/post/Post'
import { IconSpinner } from '@/components/ui/icons/IconSpinner'
import { useCallback, useRef } from 'react'
import EndReached from '@/components/ui/EndReached'

export default function Posts({ folderId, serverId, showServerName, header }) {
  const virtuoso = useRef(null)

  const [posts, loading, loadMore, hasMore] = usePosts({ folderId, serverId })

  const postRenderer = useCallback(
    (postsList, index) => {
      const post = postsList[index]
      if (!post) return <div style={{ height: '1px' }} /> // returning null or zero height breaks the virtuoso
      return (
        <div className="md:px-4 pb-1.5 px-0">
          <Post post={post} showServerName={showServerName} index={index} />
        </div>
      )
    },
    [showServerName]
  )

  return (
    <>
      <Virtuoso
        className="bg-gray-100 scrollbar-custom dark:bg-gray-750"
        components={{
          Header: header ? () => header : null,
          Footer: () =>
            hasMore ? ( loading ? <IconSpinner /> :
              <div className="flex items-center justify-center h-20">
                <button onClick={loadMore}>press to load more</button>
              </div>
            ) : (
              <EndReached />
            )
        }}
        endReached={() => {
          if (!loading && hasMore) {
            loadMore()
          }
        }}
        itemContent={i => postRenderer(posts, i)}
        overscan={100}
        ref={virtuoso}
        style={{ overflowX: 'hidden' }}
        totalCount={posts?.length || 0}
      />
    </>
  )
}

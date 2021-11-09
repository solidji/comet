import { useTranslation } from 'react-i18next'
import { useHasServerPermissions } from '@/hooks/useHasServerPermissions'
import { ServerPermission } from '@/graphql/hooks'
import { useCopyToClipboard } from 'react-use'
import { useTogglePostPin } from '@/components/post/useTogglePostPin'
import { useCurrentUser } from '@/hooks/graphql/useCurrentUser'
import ContextMenuSection from '@/components/ui/context/ContextMenuSection'
import toast from 'react-hot-toast'
import { useStore } from '@/hooks/useStore'
import { useHistory, useLocation } from 'react-router-dom'
import { useDeletePostMutation, PostsDocument } from '@/graphql/hooks'

export default function PostContextMenu({ post, ContextMenuItem }) {
  const { t } = useTranslation()
  const { push } = useHistory()
  const [canManagePosts] = useHasServerPermissions({
    server: post?.server,
    permissions: [ServerPermission.ManagePosts]
  })

  const copyToClipboard = useCopyToClipboard()[1]

  const [currentUser] = useCurrentUser()
  const [postsSort, postsTime, postsFeed] = useStore(s => [
    s.postsSort,
    s.postsTime,
    s.postsFeed
  ])
  const feed = !currentUser && postsFeed === 'Joined' ? 'Featured' : postsFeed
  const variables = {
    sort: postsSort,
    time: postsSort === 'Top' ? postsTime : null,
    serverId: post?.server?.id,
    feed
  }

  const [deletePost] = useDeletePostMutation({
    update(cache, { data: { deletePost } }) {
      const data = cache.readQuery({
        query: PostsDocument,
        variables
      })
      cache.writeQuery({
        query: PostsDocument,
        variables,
        data: {
          posts: {
            ...data.posts,
            posts: data.posts.posts.filter(c => c.id !== deletePost?.id)
          }
        }
      })
    }
  })

  // const togglePin = useTogglePostPin(post)

  const isAuthor =
    !!post.author && !!currentUser && post.author.id === currentUser.id
  const canDelete = isAuthor || canManagePosts

  /*const friends = (currentUser?.relatedUsers ?? []).filter(
    rel => rel.relationshipStatus === 'Friends'
  )*/

  /*const matchedUserFolder = matchPath(pathname, {
    path: '/folder/:folder'
  })
  const matchedServerFolder = matchPath(pathname, {
    path: '/:server/folder/:folder'
  })
  const folderName =
    matchedUserFolder?.params?.folder || matchedServerFolder?.params?.folder
  const userFolders = currentUser?.folders ?? []
  const serverFolders =
    currentUser.servers.find(s => s.id === post.server.id)?.folders ?? []
  const [addPostToFolder] = useAddPostToFolderMutation()
  const [removePostFromFolder] = useRemovePostFromFolderMutation()*/
  if (!post) return null
  return (
    <>
      <ContextMenuSection>
        {/*{userFolders.length > 0 && (
          <ContextMenuItem label={t('post.context.addToUserFolder')}>
            {userFolders.map(folder => (
              <ContextMenuItem
                key={folder.id}
                label={folder.name}
                onClick={() =>
                  addPostToFolder({
                    variables: {
                      input: {
                        folderId: folder.id,
                        postId: post.id
                      }
                    }
                  }).then(res => {
                    if (!res.error)
                      toast.success(t('folder.added', { name: folder.name }))
                  })
                }
              />
            ))}
          </ContextMenuItem>
        )}

        {serverFolders.length > 0 && (
          <ContextMenuItem label={t('post.context.addToServerFolder')}>
            {serverFolders.map(folder => (
              <ContextMenuItem
                key={folder.id}
                label={folder.name}
                onClick={() =>
                  addPostToFolder({
                    variables: {
                      input: {
                        folderId: folder.id,
                        postId: post.id
                      }
                    }
                  }).then(res => {
                    if (!res.error)
                      toast.success(t('folder.added', { name: folder.name }))
                  })
                }
              />
            ))}
          </ContextMenuItem>
        )}*/}

        {/*{friends.length > 0 && (
          <ContextMenuItem label={t('post.context.sendToFriend')}>
            {friends.map(friend => (
              <ContextMenuItem key={friend.id} label={friend.name} />
            ))}
          </ContextMenuItem>
        )}*/}

        {isAuthor && <ContextMenuItem label={t('post.context.edit')} />}
        {/*{canManagePosts && (
          <ContextMenuItem
            onClick={() => togglePin()}
            label={
              post.isPinned ? t('post.context.unpin') : t('post.context.pin')
            }
          />
        )}*/}
        <ContextMenuItem
          onClick={() => {
            copyToClipboard(`${location.origin}${post.relativeUrl}`)
          }}
          label={t('post.context.copyLink')}
        />

        {/*{folderId && (
          <ContextMenuItem
            label={t('post.context.removeFromFolder')}
            red
            onClick={() =>
              removePostFromFolder({
                variables: { input: { folderId, postId: post.id } }
              })
            }
          />
        )}*/}

        {canDelete && (
          <ContextMenuItem
            red
            onClick={() => {
              deletePost({
                variables: { input: { postId: post.id } },
                optimisticResponse: {
                  ...post,
                  isDeleted: true,
                  author: null,
                  serverUser: null
                }
              }).then(() => {
                push(`/+${post?.server?.name}`)
              })
              toast.success(t('post.context.deleted'))
            }}
            label={t('post.context.delete')}
          />
        )}
      </ContextMenuSection>
    </>
  )
}

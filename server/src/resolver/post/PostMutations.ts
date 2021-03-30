import {
  Arg,
  Args,
  Authorized,
  Ctx,
  ID,
  Mutation,
  Resolver,
  UseMiddleware
} from 'type-graphql'
import { Post, Server, PostVote } from '@/entity'
import { CreatePostArgs } from '@/resolver/post'
import { Context, ServerPermission } from '@/types'
import {
  uploadImage,
  scrapeMetadata,
  handleText,
  CheckPostAuthor,
  CheckServerPermission,
  CheckPostServerPermission
} from '@/util'

@Resolver()
export class PostMutations {
  @CheckServerPermission(ServerPermission.CreatePost)
  @Mutation(() => Post, {
    description:
      'Create a post in a server (requires ServerPermission.CreatePost)'
  })
  async createPost(
    @Args()
    { title, linkUrl, text, serverId, images }: CreatePostArgs,
    @Ctx() { user, em }: Context
  ) {
    if (text) {
      text = handleText(text)
      if (!text) text = null
    }

    const server = await em.findOne(Server, serverId)

    const imageUrls = []

    if (images && images.length > 0) {
      for (const image of images) {
        const imageUrl = await uploadImage(image)
        imageUrls.push(imageUrl)
      }
    }

    const post = em.create(Post, {
      title,
      linkUrl,
      author: user,
      server,
      linkMetadata: linkUrl ? await scrapeMetadata(linkUrl) : null,
      imageUrls,
      text: text
    })

    await em.persistAndFlush(post)

    await this.createPostVote({ user, em }, post.id)
    post.isVoted = true
    post.voteCount = 1

    return post
  }

  @CheckPostAuthor()
  @Mutation(() => Post, {
    description: 'Edit a post (must be author)'
  })
  async editPost(
    @Arg('postId', () => ID, { description: 'ID of post to edit' })
    postId: string,
    @Arg('text') text: string,
    @Ctx() { user, em }: Context
  ) {
    const post = await em.findOne(Post, postId)

    text = handleText(text)
    if (!text) text = null

    post.text = text
    post.editedAt = new Date()

    await em.persistAndFlush(post)

    return post
  }

  @CheckPostAuthor()
  @Mutation(() => Boolean, {
    description: 'Delete a post (must be author)'
  })
  async deletePost(
    @Arg('postId', () => ID) postId: string,
    @Ctx() { user, em }: Context
  ) {
    const post = await em.findOne(Post, postId)
    post.isDeleted = true
    post.isPinned = false
    await em.persistAndFlush(post)
    return true
  }

  @CheckPostServerPermission(ServerPermission.VotePost)
  @Mutation(() => Post, { description: 'Add vote to post' })
  async createPostVote(
    @Ctx() { user, em }: Context,
    @Arg('postId', () => ID, {
      description: 'ID of post to vote (requires ServerPermission.VotePost)'
    })
    postId: string
  ) {
    const post = await em.findOneOrFail(Post, postId)
    let vote = await em.findOne(PostVote, { user, post })
    if (vote) throw new Error('You have already voted this post')
    vote = em.create(PostVote, { user, post })
    post.voteCount++
    post.isVoted = true
    await em.persistAndFlush([post, vote])
    return post
  }

  @CheckPostServerPermission(ServerPermission.VotePost)
  @Mutation(() => Post, { description: 'Remove vote from post' })
  async removePostVote(
    @Ctx() { user, em }: Context,
    @Arg('postId', () => ID, {
      description:
        'ID of post to remove vote (requires ServerPermission.VotePost)'
    })
    postId: string
  ) {
    const post = await em.findOneOrFail(Post, postId)
    const vote = await em.findOneOrFail(PostVote, { user, post })
    post.voteCount--
    post.isVoted = false
    await em.remove(vote).persistAndFlush([post])
    return post
  }

  @CheckPostServerPermission(ServerPermission.ManagePosts)
  @Mutation(() => Boolean, {
    description: 'Remove a post (requires ServerPermission.ManagePosts)'
  })
  async removePost(
    @Ctx() { em }: Context,
    @Arg('postId', () => ID) postId: string,
    @Arg('reason', { nullable: true }) reason?: string
  ) {
    const post = await em.findOne(Post, postId)

    em.assign(post, {
      isRemoved: true,
      removedReason: reason,
      isPinned: false,
      pinPosition: null
    })
    await em.persistAndFlush(post)
    return true
  }

  @CheckPostServerPermission(ServerPermission.ManagePosts)
  @Mutation(() => Post, {
    description: 'Pin a post (requires ServerPermission.PinPosts)'
  })
  async pinPost(
    @Arg('postId', () => ID, { description: 'ID of post to pin' })
    postId: string,
    @Ctx() { em }: Context
  ) {
    const post = await em.findOne(Post, postId)
    if (post.isPinned) throw new Error('Post is already pinned')
    post.isPinned = true
    await em.persistAndFlush(post)
    return post
  }

  @CheckPostServerPermission(ServerPermission.ManagePosts)
  @Mutation(() => Post, {
    description: 'Unpin a post (requires ServerPermission.PinPosts)'
  })
  async unpinPost(
    @Arg('postId', () => ID, { description: 'ID of post to unpin' })
    postId: string,
    @Ctx() { em }: Context
  ) {
    const post = await em.findOne(Post, postId)
    if (!post.isPinned) throw new Error('Post is not pinned')
    post.isPinned = false
    await em.persistAndFlush(post)
    return post
  }
}

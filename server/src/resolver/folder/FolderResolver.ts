import {
  Arg,
  Authorized,
  Ctx,
  ID,
  Mutation,
  Publisher,
  PubSub,
  Query,
  Resolver
} from 'type-graphql'
import { Folder } from '@/entity'
import { Context } from '@/types'
import { folder } from './queries'
import {
  createFolder,
  CreateFolderInput,
  updateFolder,
  UpdateFolderInput,
  deleteFolder,
  DeleteFolderInput,
  moveUserFolder,
  MoveUserFolderInput,
  moveServerFolder,
  MoveServerFolderInput,
  followFolder,
  FollowFolderInput,
  unfollowFolder,
  UnfollowFolderInput,
  addPostToFolder,
  AddPostToFolderInput,
  removePostFromFolder,
  RemovePostFromFolderInput
} from './mutations'
import { ChangePayload, SubscriptionTopic } from '@/resolver/subscriptions'

@Resolver(() => Folder)
export class FolderResolver {
  // --- Queries ---
  @Authorized()
  @Query(() => Folder)
  async folder(
    @Ctx() ctx: Context,
    @Arg('folderId', () => ID) folderId: string
  ): Promise<Folder> {
    return folder(ctx, folderId)
  }

  // --- Mutations ---
  @Authorized()
  @Mutation(() => Folder)
  async createFolder(
    @Ctx() ctx: Context,
    @Arg('input') input: CreateFolderInput
  ): Promise<Folder> {
    return createFolder(ctx, input)
  }

  @Authorized()
  @Mutation(() => Folder)
  async updateFolder(
    @Ctx() ctx: Context,
    @Arg('input') input: UpdateFolderInput
  ): Promise<Folder> {
    return updateFolder(ctx, input)
  }

  @Authorized()
  @Mutation(() => Boolean)
  async deleteFolder(
    @Ctx() ctx: Context,
    @Arg('input') input: DeleteFolderInput
  ): Promise<boolean> {
    return deleteFolder(ctx, input)
  }

  @Authorized()
  @Mutation(() => Folder)
  async moveUserFolder(
    @Ctx() ctx: Context,
    @Arg('input') input: MoveUserFolderInput
  ): Promise<Folder> {
    return moveUserFolder(ctx, input)
  }

  @Authorized()
  @Mutation(() => Folder)
  async moveServerFolder(
    @Ctx() ctx: Context,
    @Arg('input') input: MoveServerFolderInput
  ): Promise<Folder> {
    return moveServerFolder(ctx, input)
  }

  @Authorized()
  @Mutation(() => Folder)
  async followFolder(
    @Ctx() ctx: Context,
    @Arg('input') input: FollowFolderInput
  ): Promise<Folder> {
    return followFolder(ctx, input)
  }

  @Authorized()
  @Mutation(() => Folder)
  async unfollowFolder(
    @Ctx() ctx: Context,
    @Arg('input') input: UnfollowFolderInput
  ): Promise<Folder> {
    return unfollowFolder(ctx, input)
  }

  @Authorized()
  @Mutation(() => Folder)
  async addPostToFolder(
    @Ctx() ctx: Context,
    @Arg('input') input: AddPostToFolderInput,
    @PubSub(SubscriptionTopic.PostChanged)
    notifyPostChanged: Publisher<ChangePayload>
  ): Promise<Folder> {
    return addPostToFolder(ctx, input, notifyPostChanged)
  }

  @Authorized()
  @Mutation(() => Folder)
  async removePostFromFolder(
    @Ctx() ctx: Context,
    @Arg('input') input: RemovePostFromFolderInput,
    @PubSub(SubscriptionTopic.PostChanged)
    notifyPostChanged: Publisher<ChangePayload>
  ): Promise<Folder> {
    return removePostFromFolder(ctx, input, notifyPostChanged)
  }
}

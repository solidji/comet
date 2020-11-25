import { Arg, Args, Authorized, Ctx, Mutation, Resolver } from 'type-graphql'
import { LoginResponse } from '@/auth/LoginResponse'
import { LoginArgs } from '@/auth/LoginArgs'
import { Context } from '@/Context'
import { User } from '@/user/User.Entity'
import { Repository } from 'typeorm'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { createAccessToken } from '@/auth/AuthTokens'
import * as argon2 from 'argon2'
import { SignUpArgs } from '@/auth/SignUpArgs'
import { bannedWords } from '@/BannedWords'
import { format } from 'date-fns'
import { UserProfile } from '@/user/data/UserProfile'

@Resolver()
export class AuthResolver {
  @InjectRepository(User) readonly userRepository: Repository<User>

  @Mutation(() => LoginResponse)
  async signUp(
    @Args() { username, password, email }: SignUpArgs,
    @Ctx() { res }: Context
  ) {
    if (
      username.toLowerCase() === 'null' ||
      username.toLowerCase() === 'undefined'
    )
      throw new Error('Invalid username')

    bannedWords.forEach(u => {
      if (username.toLowerCase().includes(u.toLowerCase())) {
        throw new Error('Inappropriate Username')
      }
    })

    const foundUser = await this.userRepository.findOne({
      where: `"username" ILIKE '${username.replace(/_/g, '\\_')}'`
    })
    if (foundUser) throw new Error('Username taken')

    const passwordHash = await argon2.hash(password)

    const user = await this.userRepository.save({
      username,
      email,
      passwordHash,

      lastLogin: new Date(),
      profile: {
        bio: `My name is ${username} and I joined CometX.io on ${format(
          new Date(),
          'MMM. do, yyyy'
        )}`,
        ...new UserProfile()
      }
    } as User)

    const accessToken = createAccessToken(user)
    res.cookie('token', accessToken, {
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      httpOnly: true
    })

    return {
      accessToken,
      user
    } as LoginResponse
  }

  @Mutation(() => LoginResponse)
  async login(
    @Args() { username, password }: LoginArgs,
    @Ctx() { res }: Context
  ) {
    const user = await this.userRepository.findOne({
      where: `"username" ILIKE '${username.replace(/_/g, '\\_')}'`
    })
    if (!user) throw new Error('Invalid Login')

    // if (user.banned) throw new Error('Banned: ' + user.banReason)

    await this.userRepository
      .createQueryBuilder()
      .update()
      .set({ lastLogin: new Date() })
      .where('username = :username', { username })
      .execute()

    const match = await argon2.verify(user.passwordHash, password)

    if (!match) throw new Error('Invalid Login')

    const accessToken = createAccessToken(user)
    res.cookie('token', accessToken, {
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      httpOnly: true
    })

    return {
      accessToken,
      user
    } as LoginResponse
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { res }: Context) {
    res.clearCookie('token')

    return true
  }

  @Authorized()
  @Mutation(() => LoginResponse)
  async changePassword(
    @Arg('oldPassword') oldPassword: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { userId }: Context
  ) {
    const user = await this.userRepository.findOne(userId)
    const match = await argon2.verify(user.passwordHash, oldPassword)

    if (!match) throw new Error('Current password incorrect!')

    await this.userRepository
      .createQueryBuilder()
      .update()
      .set({ passwordHash: await argon2.hash(newPassword) })
      .where('id = :userId', { userId })
      .execute()

    return {
      accessToken: createAccessToken(user),
      user
    } as LoginResponse
  }
}

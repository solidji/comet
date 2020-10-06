import {
  ArgsOf,
  Client,
  CommandMessage,
  CommandNotFound,
  Discord,
  On
} from '@typeit/discord'
import { MessageEmbed } from 'discord.js'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { Community } from '@/entities/Community'
import { getRepository, Repository } from 'typeorm'
import { User } from '@/entities/User'

@Discord()
abstract class DiscordBot {
  /*@InjectRepository(Community) readonly communityRepository: Repository<
    Community
  >*/

  private communityRepository = getRepository(Community)
  private userRepository = getRepository(User)

  @On('message')
  private async community(
    [message]: ArgsOf<'message'>, // Type message automatically
    client: Client
  ) {
    const words = message.content.split(' ')

    for (let i = 0; i < words.length; i++) {
      const word = words[i]

      if (word.startsWith('+')) {
        const community = await this.communityRepository
          .createQueryBuilder('community')
          .where('community.name ILIKE :name', {
            name: word.substring(1).replace(/_/g, '\\_')
          })
          .getOne()

        if (community) {
          message.reply(
            new MessageEmbed()
              .setTitle(`+${community.name}`)
              .setDescription(community.profile.description)
              .setColor(community.profile.color || 0x5a67d8)
              .setURL(`https://www.cometx.io/+${community.name}`)
              .setImage(community.profile.avatar)
              .setFooter('CometX.io', 'https://dev.cometx.io/icon.png')
          )
        } else {
          message.reply('Planet not found')
        }
      } else if (word === '@' && i + 1 < words.length && !!words[i + 1]) {
        const user = await this.userRepository
          .createQueryBuilder('user')
          .where('user.username ILIKE :username', {
            username: words[i + 1].replace(/_/g, '\\_')
          })
          .loadRelationCountAndMap('user.postCount', 'user.posts')
          .loadRelationCountAndMap('user.commentCount', 'user.comments')
          .getOne()

        if (user) {
          message.reply(
            new MessageEmbed()
              .setTitle(`@${user.username}`)
              .setDescription(user.profile.bio)
              .setColor(0x5a67d8)
              .setURL(`https://www.cometx.io/@${user.username}`)
              .setImage(user.profile.avatar)
              .setFooter('CometX.io', 'https://dev.cometx.io/icon.png')
              .addFields(
                { name: '**Posts**', value: user.postCount, inline: true },
                { name: '**Comments**', value: user.commentCount, inline: true }
              )
          )
        } else {
          message.reply('User not found')
        }
      }
    }
  }

  @CommandNotFound()
  private async notFound(message: CommandMessage, client: Client) {
    message.reply('Command not found')
  }
}

import { Field, ID, InputType } from 'type-graphql'
import { Length } from 'class-validator'

@InputType()
export class UpdateServerUserInput {
  @Field(() => ID)
  userId: string

  @Field(() => ID)
  serverId: string

  @Field({ nullable: true })
  @Length(1, 1000)
  nickname: string
}

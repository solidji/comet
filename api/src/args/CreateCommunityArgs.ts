import { ArgsType, Field } from 'type-graphql'
import { Length, Matches, ArrayMinSize, ArrayMaxSize } from 'class-validator'

@ArgsType()
export class CreateCommunityArgs {
  @Field()
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Community name can only have letters, numbers, and underscores.'
  })
  @Length(3, 21, {
    message: 'Community name must be between 3 and 21 characters.'
  })
  name: string

  @Field()
  @Length(1, 100000, {
    message: 'Community description must be no longer than 100000 characters.'
  })
  description: string

  @Field(() => [String])
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @Matches(/^[a-zA-Z0-9-]+$/, {
    message: 'Tags can only have letters, numbers, and dashes.',
    each: true
  })
  tags: string[]
}

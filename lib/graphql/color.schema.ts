import { gql } from 'graphql-tag'

import { Color, colorSchema } from '../domain/models/color'
import { ResolverContext } from './resolvers'

type Parent = { color: Color }

export const typeDefs = gql`
  enum Color {
    ${Object.values(colorSchema.Enum)}
  }

  type ColorTally {
    color: Color!
    """
    The \`User\`'s who have this color set as their favorite
    """
    favoriteOf: [User!]!
  }
`

/**
 * Each resolver should fetch its own data. Then our dataloaders
 * will take care of deduping
 */
export const resolvers = {
  ColorTally: {
    color: ({ color }: Parent) => color,
    favoriteOf: async (
      { color }: Parent,
      _args: undefined,
      {
        domain: {
          apis: { Profile }
        }
      }: ResolverContext
    ) => {
      const res = await Profile.findColorTally({ data: { color } })
      return res._ids.map((_id) => ({ _id }))
    }
  },
  Color: colorSchema.Enum
}

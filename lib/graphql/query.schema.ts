import { gql } from 'graphql-tag'
import { ResolverContext } from './resolvers'

export const typeDefs = gql`
  type Query {
    """
    Retrieve a user by their \`ID\`
    """
    user(id: ID!): User

    """
    Retrieve the \`ColorTally\` for the given \`Color\`
    """
    colorTally(color: Color!): ColorTally!
  }
`

export const resolvers = {
  Query: {
    user: async (
      _: undefined,
      { id }: { id: string },
      {
        domain: {
          apis: { User }
        }
      }: ResolverContext
    ) => {
      const user = await User.findById(id)
      return user
    },
    colorTally: (_: undefined, { color }: { color: string }) => ({ color })
  }
}

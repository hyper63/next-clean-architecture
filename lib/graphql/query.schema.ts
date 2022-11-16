import { gql } from 'graphql-tag'
import { ResolverContext } from './resolvers'

export const typeDefs = gql`
  type Query {
    """
    Retrieve a user by their \`ID\`
    """
    user(id: ID!): User
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
    }
  }
}

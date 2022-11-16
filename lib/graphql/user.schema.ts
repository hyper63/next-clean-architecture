import { gql } from 'graphql-tag'

import type { Parent, ResolverContext } from './resolvers'

export const typeDefs = gql`
  type User {
    """
    The unique identifier of the \`User\`
    """
    _id: ID!
    """
    The email of the \`User\`
    """
    email: String!
    """
    A computed field
    """
    name: String!
    """
    The \`User\` that created this \`User\`

    could be self-referential ie. the \`User\` created themselves
    """
    createdBy: User!
  }
`

/**
 * Each resolver should fetch its own data. Then our dataloaders
 * will take care of deduping
 */
export const resolvers = {
  User: {
    _id: ({ _id }: Parent) => _id,
    email: async (
      { _id }: Parent,
      _args: undefined,
      {
        domain: {
          apis: { User }
        }
      }: ResolverContext
    ) => {
      const user = await User.findById(_id)
      return user.email
    },
    name: async (
      { _id }: Parent,
      _args: undefined,
      {
        domain: {
          apis: { User }
        }
      }: ResolverContext
    ) => {
      const user = await User.findById(_id)
      return user.email.split('@').shift() || ''
    },
    createdBy: async (
      { _id }: Parent,
      _args: undefined,
      {
        domain: {
          apis: { User }
        }
      }: ResolverContext
    ) => {
      const user = await User.findById(_id)
      // Our resolvers will do the lifting for us
      return { _id: user.createdBy }
    }
  }
}

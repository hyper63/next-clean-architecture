import { gql } from 'graphql-tag'

import { colorSchema } from '../domain/models/user'
import type { Parent, ResolverContext } from './resolvers'

export const typeDefs = gql`
  enum Color {
    ${Object.values(colorSchema.Enum)}
  }

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
    The url for the \`User\`'s avatar
    """
    avatarUrl: String!

    """
    The favorite color of the \`User\`
    """
    favoriteColor: Color!

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
      return user.name || user.email.split('@').shift() || ''
    },
    avatarUrl: async (
      { _id }: Parent,
      _args: undefined,
      {
        domain: {
          apis: { User }
        }
      }: ResolverContext
    ) => {
      const user = await User.findById(_id)
      return user.avatarUrl
    },
    favoriteColor: async (
      { _id }: Parent,
      _args: undefined,
      {
        domain: {
          apis: { User }
        }
      }: ResolverContext
    ) => {
      const user = await User.findById(_id)
      return user.favoriteColor
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
  },
  Color: colorSchema.Enum
}

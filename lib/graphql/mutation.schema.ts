import { gql } from 'graphql-tag'

import { Color } from '../domain/models/color'
import { extractTypedError, ResolverContext, typedErrorResolver } from './resolvers'

export const typeDefs = gql`
  type Mutation {
    """
    Create a new \`User\`
    """
    createUser(input: CreateUserInput!): CreateUserResult
  }

  input CreateUserInput {
    email: String!
    name: String
    avatarUrl: String!
    favoriteColor: Color!
  }

  type CreateUserResult {
    """
    The created \`User\`, if successful
    """
    user: User
    """
    Domain specific errors as a result of
    attempting to create the \`User\`
    """
    errors: [CreateUserError!]
  }

  """
  An \`Error\` that could arise as a result of
  attemting to create a \`User\`
  """
  union CreateUserError = UserAlreadyExists | GenericError
`

export const resolvers = {
  Mutation: {
    createUser: async (
      _: undefined,
      {
        input
      }: { input: { email: string; name?: string; avatarUrl: string; favoriteColor: Color } },
      {
        domain: {
          apis: { Profile }
        }
      }: ResolverContext
    ) => {
      return Profile.onboardUser({
        data: input,
        /**
         * This would actually be derived from some sort of session,
         * also passes via graphql context
         */
        by: {
          isAdmin: false
        }
      })
        .then((user) => ({ user, errors: undefined }))
        .catch((err) => ({ user: undefined, errors: [extractTypedError(err)] }))
    }
  },
  CreateUserError: { __resolveType: typedErrorResolver }
}

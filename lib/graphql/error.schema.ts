import { gql } from 'graphql-tag'

import * as _Err from '../domain/models/err'
import { typedErrorResolver } from './resolvers'

const { TypedErrorConstructorNames, toTypedErr, ...Err } = _Err

export const typeDefs = gql`
  interface Error {
    message: String!
    status: Int
  }

  # Clever way to make each of our domain error types
  # into a GraphQL domain error type that implements our GraphQL Error type
  ${TypedErrorConstructorNames.map((name) => {
    return `
        """
        ${Err[name as keyof typeof Err].description}
        """
        type ${Err[name as keyof typeof Err].type} implements Error {
          message: String!
          status: Int
        }
    `
  }).join('\n')}
`

export const resolvers = {
  Error: {
    __resolveType: typedErrorResolver
  }
}

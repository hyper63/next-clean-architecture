import { identity, pipe } from 'ramda'
import type { DocumentNode, GraphQLSchema } from 'graphql'
import type { IResolvers } from '@graphql-tools/utils'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { gql } from 'graphql-tag'

// Types
import * as User from './user.schema'
import * as Color from './color.schema'
import * as Error from './error.schema'
// Entrypoints
import * as Query from './query.schema'
import * as Mutation from './mutation.schema'

const minis: {
  typeDefs: DocumentNode
  resolvers: IResolvers
  transformer?: (schema: GraphQLSchema) => GraphQLSchema
}[] = [User, Color, Error, Query, Mutation]

const typeDefs = minis.map((m) => m.typeDefs || gql``)
const resolvers = minis.map((m) => m.resolvers || {})
const transformers = minis
  .map(({ transformer = identity<GraphQLSchema> }) => transformer)
  .reduce(pipe, identity<GraphQLSchema>)

/**
 * Combine all the little schemas into the full schema,
 * wrapping with transformers ie. directives
 */
export const schema = transformers(
  makeExecutableSchema({
    typeDefs,
    resolvers,
    inheritResolversFromInterfaces: true
  })
)

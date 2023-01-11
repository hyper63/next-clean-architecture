import { makeExecutableSchema } from '@graphql-tools/schema'
import { gql } from 'graphql-tag'

// Types
import * as User from './user.schema'
import * as Color from './color.schema'
import * as Error from './error.schema'
// Entrypoints
import * as Query from './query.schema'
import * as Mutation from './mutation.schema'

const minis = [User, Color, Error, Query, Mutation]

/**
 * Combine all the little schemas into the full schema
 *
 * you may also want to supply transforms or directives here
 */
export const schema = makeExecutableSchema({
  typeDefs: minis.map((m) => m.typeDefs || gql``),
  resolvers: minis.map((m) => m.resolvers || {})
})

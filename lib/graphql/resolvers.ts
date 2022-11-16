import type { IncomingMessage } from 'http'
import { compose, pick } from 'ramda'

import { Id } from '../domain/models/doc'
import * as _Err from '../domain/models/err'
import type { TypedError } from '../domain/models/err'

const { TypedErrorConstructorNames, toTypedErr, ...Err } = _Err

export type ResolverContext = IncomingMessage
export type Parent<T = {}> = { _id: Id } & T

export const typedErrorResolver = (err: TypedError) => err.type || 'GenericError'

/**
 * If graphql runtime receives an instanceof Error for any field in a resolver,
 * it will immiediatley fail and stop resolving.
 *
 * So we use this utility to extract the fields from our domain errors,
 * so that domain specific graphql errors work and fields continue to resolve
 */
export const extractTypedError = compose(
  pick(['type', 'message', 'status']),
  (err: any): TypedError => {
    const c = TypedErrorConstructorNames.find((c) => err instanceof Err[c as keyof typeof Err])
    return c ? err : new Err.GenericError(err.message || err.msg || err)
  }
)

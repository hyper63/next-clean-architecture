import cuid from 'cuid'
import { pipe } from 'ramda'
import z from 'zod'

import {
  addCreatedBy,
  addType,
  addUpdatedBy,
  docSchema,
  idSchema,
  create as docCreate
} from './doc'
import { UserAlreadyExistsError } from './err'

export const colorSchema = z.enum(['red', 'blue', 'yellow'])
export type Color = z.infer<typeof colorSchema>

export const userDocSchema = docSchema
  .extend({
    email: z.string().email(),
    name: z.string().optional(),
    avatarUrl: z.string().url(),
    favoriteColor: colorSchema,
    /**
     * The user that created this user.
     * Could be reflexive, in that a user may create themself
     * or could refer to an admin user
     */
    createdBy: idSchema,
    updatedBy: idSchema,
    type: z.literal('user')
  })
  .strip()

export type UserDoc = z.infer<typeof userDocSchema>

/**
 * Allow the domain model and doc model to diverge over time,
 * but they may start as the same shape
 */
export const userSchema = userDocSchema
export type User = z.infer<typeof userSchema>

export const actorSchema = z.object({
  _id: idSchema.optional(),
  // Derived from claims on access token passed to route, extracted by route handling ie. middleware
  isAdmin: z.boolean().optional().default(false)
})
export type Actor = z.infer<typeof actorSchema>

const createSchema = z.object({
  data: userDocSchema.pick({ email: true, name: true, avatarUrl: true, favoriteColor: true }),
  exists: z.boolean(),
  by: actorSchema
})
export const create = (input: z.infer<typeof createSchema>) => {
  const { data, exists, by } = createSchema.parse(input)

  if (exists) throw new UserAlreadyExistsError(`user with email ${data.email} already exists`)

  const _id = cuid()

  // use our domain models to parse a document
  const doc = pipe(
    addCreatedBy(by._id || _id),
    addUpdatedBy(by._id || _id),
    addType('user'),
    // Map service model to persistence model
    docCreate(userDocSchema)
  )({ ...data, _id })

  return doc
}

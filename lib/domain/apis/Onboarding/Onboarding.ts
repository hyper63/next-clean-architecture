import { pipe } from 'ramda'
import z from 'zod'

import { addCreatedBy, addType, addUpdatedBy, create, typeSchema } from '../../models/doc'
import { GenericError, UserAlreadyExistsError } from '../../models/err'
import {
  actorSchema,
  newUserSchema,
  User,
  UserDoc,
  userDocSchema,
  userSchema
} from '../../models/user'
import { DomainContext } from '../../types'

const onboardUserSchema = z.object({
  data: newUserSchema,
  by: actorSchema
})

export class Onboarding {
  constructor(private context: DomainContext) {}

  /**
   * Every api has an input schema, for compile time validation and runtime validation
   * via zod
   */
  async onboardUser(input: z.infer<typeof onboardUserSchema>): Promise<User> {
    const {
      clients: { hyper }
    } = this.context

    const { data, by } = onboardUserSchema.parse(input)

    const query = await hyper.data.query<UserDoc>({ type: typeSchema.Enum.user, email: data.email })

    if (!query.ok) {
      throw new GenericError(query.msg)
    }

    const [exists] = query.docs

    if (exists) {
      throw new UserAlreadyExistsError(`user with email ${data.email} already exists`)
    }

    // use our domain models to parse a document
    const doc = pipe(
      addCreatedBy(by._id),
      addUpdatedBy(by._id),
      addType('user'),
      // Map service model to persistence model
      create(userDocSchema)
    )(data)

    // create the document in hyper
    const add = await hyper.data.add(doc)
    if (!add.ok) {
      throw new GenericError(add.msg)
    }

    // Map persistence model to service model
    return userSchema.parse(doc)
  }
}

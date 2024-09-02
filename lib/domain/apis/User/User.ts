import { Id, idSchema } from '../../models/doc'
import { UserNotFoundError } from '../../models/err'
import { userSchema } from '../../models/user'
import { DomainContext } from '../../types'

/**
 * Model apis are convenience for calling a dataloader
 * and parsing the result into a model
 *
 * A Model api's only concerns are giving/enforcing a specific data structure.
 *
 * Nothing else.
 */
export class User {
  constructor(private context: DomainContext) {}

  async findById(id: Id) {
    const {
      dataloaders: { findByIdDataloader }
    } = this.context

    const doc = await findByIdDataloader.load(idSchema.parse(id))
    if (!doc) throw new UserNotFoundError(`User with id ${id} not found`)
    return userSchema.parse(doc)
  }
}

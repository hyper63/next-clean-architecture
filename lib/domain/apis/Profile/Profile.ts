import z from 'zod'

import { typeSchema } from '../../models/doc'
import { GenericError } from '../../models/err'
import { actorSchema, create as createUser, User, UserDoc, userSchema } from '../../models/user'
import {
  ColorTally,
  colorSchema,
  create as createColorTally,
  colorTallySchema
} from '../../models/color'
import { DomainContext } from '../../types'

const onboardUserSchema = z.object({
  data: userSchema.pick({ email: true, name: true, avatarUrl: true, favoriteColor: true }),
  by: actorSchema
})

const findColorTallySchema = z.object({
  data: z.object({ color: colorSchema })
})

export class Profile {
  constructor(private context: DomainContext) {}

  /**
   * Every domain api follows the same structure:
   * 1. Parse the input
   * 2. Potential side effects to gather data and check actor permissions
   * 4. Invoke business logic
   * 5. Potential side effects to persist data
   * 6. Map DTO
   *
   * This creates a sort of "sandwich" around our pure business logic.
   * compose business logic into more pure functions to create complex,
   * but easily unit testable, flows.
   */
  async onboardUser(input: z.infer<typeof onboardUserSchema>): Promise<User> {
    const {
      clients: { data, cache }
    } = this.context

    // Parse input
    const { data: inputData, by } = onboardUserSchema.parse(input)

    // Query Side Effects
    const query = await data.query<UserDoc>({ type: typeSchema.Enum.user, email: inputData.email })
    if (!query.ok) throw new GenericError(query.msg)
    const [exists] = query.docs

    // BL
    const doc = createUser({ data: inputData, exists: !!exists, by })

    // Persistence Side Effects
    const add = await data.add(doc)
    if (!add.ok) throw new GenericError(add.msg)
    await cache.remove(`color-tally-${doc.favoriteColor}`)

    // Map DTO
    return userSchema.parse(doc)
  }

  async findColorTally(input: z.infer<typeof findColorTallySchema>) {
    const {
      clients: { cache },
      dataloaders: { findByFavoriteColorDataloader }
    } = this.context

    // Parse input
    const {
      data: { color }
    } = findColorTallySchema.parse(input)
    const key = `color-tally-${color}`

    // HIT Query Side Effects
    const hit = await cache.get<ColorTally>(key)
    // HIT BL
    if (hit.ok) return hit.doc

    // MISS Query Side Effects
    const users = await findByFavoriteColorDataloader.load(color)
    // MISS BL
    const res = createColorTally({ users })
    // MISS Persistence Side Effects
    await cache.set<ColorTally>(key, res, '5s')

    // Map DTO
    return colorTallySchema.parse(res)
  }
}

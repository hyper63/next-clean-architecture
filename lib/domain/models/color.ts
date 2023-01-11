import { applySpec, length, pluck } from 'ramda'
import z from 'zod'
import { idSchema } from './doc'

export const colorSchema = z.enum(['red', 'blue', 'yellow'])
export type Color = z.infer<typeof colorSchema>

export const colorTallySchema = z.object({
  tally: z.number(),
  _ids: z.array(idSchema)
})
export type ColorTally = z.infer<typeof colorTallySchema>

const createSchema = z.object({
  users: z.array(z.object({ _id: idSchema }))
})
export const create = (input: z.infer<typeof createSchema>) => {
  const { users } = createSchema.parse(input)
  return colorTallySchema.parse(
    applySpec({
      tally: length,
      _ids: pluck('_id')
    })(users)
  )
}

import { generateMock, type GenerateMockOptions } from '@anatine/zod-mock'
import cuid from 'cuid'
import type { ZodSchema } from 'zod'

export const stubOf = (schema: ZodSchema, opts: GenerateMockOptions = {}) =>
  generateMock(schema, {
    ...opts,
    stringMap: {
      _id: () => cuid(),
      createdBy: () => cuid(),
      updatedBy: () => cuid(),
      email: () => 'foo@bar.com',
      ...opts.stringMap
    }
  })

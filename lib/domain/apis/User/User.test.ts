import { describe, expect, test, vi } from 'vitest'
import cuid from 'cuid'

import { userDocSchema, userSchema } from '../../models/user'
import { User } from './User'
import { stubOf } from '../../test-utils'
import { UserNotFoundError } from '../../models/err'

const context = {
  dataloaders: {
    findByIdDataloader: {
      load: async (_id: string) => stubOf(userDocSchema)
    }
  }
}

describe('User', () => {
  // @ts-ignore
  const user = new User(context)

  describe('findById', () => {
    test('it should return user', async () => {
      const res = await user.findById(cuid())
      expect(() => userSchema.parse(res)).not.toThrow()
    })

    test('it should throw if the user is not found', async () => {
      vi.spyOn(context.dataloaders.findByIdDataloader, 'load').mockImplementationOnce(
        async () => undefined
      )
      await expect(() => user.findById(cuid())).rejects.toThrow(UserNotFoundError)
    })
  })
})

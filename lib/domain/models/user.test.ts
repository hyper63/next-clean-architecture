import { describe, expect, test } from 'vitest'
import cuid from 'cuid'

import { create, userDocSchema } from './user'
import { UserAlreadyExistsError } from './err'

describe('user', () => {
  describe('create', () => {
    const data = {
      email: 'foo@bar.com',
      avatarUrl: 'https://fake.url',
      favoriteColor: 'red' as const
    }

    test('it should create the user', () => {
      const by = cuid()
      const res = create({
        data,
        exists: false,
        by: { _id: by, isAdmin: false }
      })

      expect(() => userDocSchema.parse(res)).not.toThrow()
      expect(res).toMatchObject({
        email: data.email,
        createdBy: by,
        updatedBy: by,
        type: 'user'
      })
    })

    test('it should set by to be self-referential', () => {
      const res = create({
        data,
        exists: false,
        by: { isAdmin: false }
      })

      expect(() => userDocSchema.parse(res)).not.toThrow()
      expect(res).toMatchObject({
        email: data.email,
        createdBy: res._id,
        updatedBy: res._id,
        type: 'user'
      })
    })

    test('it should throw if missing required fields', () => {
      expect(() =>
        create({
          // @ts-ignore
          data: { email: 'foo@bar.com' },
          exists: false,
          by: { _id: cuid(), isAdmin: false }
        })
      ).toThrow()
    })

    test('it should throw if the user already exists', () => {
      expect(() =>
        create({
          data,
          exists: true,
          by: { _id: cuid(), isAdmin: false }
        })
      ).toThrow(UserAlreadyExistsError)
    })
  })
})

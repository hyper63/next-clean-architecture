import { describe, expect, test, vi } from 'vitest'
import cuid from 'cuid'
import { connect } from 'hyper-connect'

import { GenericError } from '../../models/err'
import { userSchema } from '../../models/user'

import { Profile } from './Profile'

const context = {
  clients: {
    hyper: connect('http://mock.hyper.io/test')
  }
}

describe('Profile', () => {
  // @ts-ignore
  const profile = new Profile(context)

  describe('onboardUser', () => {
    test('it should create the user', async () => {
      vi.spyOn(context.clients.hyper.data, 'query').mockImplementationOnce(async () => ({
        ok: true,
        docs: []
      }))

      vi.spyOn(context.clients.hyper.data, 'add').mockImplementationOnce(async () => ({
        ok: true,
        id: 'foo'
      }))

      const res = await profile.onboardUser({
        data: { email: 'foo@foo.com' },
        by: { _id: cuid(), isAdmin: false }
      })
      expect(() => userSchema.parse(res)).not.toThrow()
    })

    test('it should bubble a GenericError', async () => {
      // error on query check
      vi.spyOn(context.clients.hyper.data, 'query').mockImplementationOnce(async () => ({
        ok: false as const,
        msg: 'woops',
        status: 400
      }))

      expect(() =>
        profile.onboardUser({
          data: { email: 'foo@foo.com' },
          by: { _id: cuid(), isAdmin: false }
        })
      ).rejects.toThrow(GenericError)

      vi.spyOn(context.clients.hyper.data, 'query').mockImplementationOnce(async () => ({
        ok: true,
        docs: []
      }))

      // error on document add
      vi.spyOn(context.clients.hyper.data, 'add').mockImplementationOnce(async () => ({
        ok: false as const,
        msg: 'oops'
      }))

      expect(() =>
        profile.onboardUser({
          data: { email: 'foo@foo.com' },
          by: { _id: cuid(), isAdmin: false }
        })
      ).rejects.toThrow(GenericError)
    })
  })
})

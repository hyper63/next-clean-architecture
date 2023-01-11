import { describe, expect, test, vi } from 'vitest'
import cuid from 'cuid'
import { connect } from 'hyper-connect'

import { stubOf } from '../../test-utils'
import { GenericError } from '../../models/err'
import { userDocSchema, userSchema } from '../../models/user'

import { Profile } from './Profile'
import { colorTallySchema } from '../../models/color'

const context = {
  clients: {
    ...connect('http://mock.hyper.io/test')
  },
  dataloaders: {
    findByFavoriteColorDataloader: {
      load: async () => [0, 0, 0].map(() => stubOf(userDocSchema))
    }
  }
}

describe('Profile', () => {
  // @ts-ignore
  const profile = new Profile(context)

  describe('onboardUser', () => {
    const data = {
      email: 'foo@bar.com',
      avatarUrl: 'https://fake.url',
      favoriteColor: 'red' as const
    }

    test('it should create the user', async () => {
      vi.spyOn(context.clients.data, 'query').mockImplementationOnce(async () => ({
        ok: true,
        docs: []
      }))

      vi.spyOn(context.clients.data, 'add').mockImplementationOnce(async () => ({
        ok: true,
        id: 'foo'
      }))

      vi.spyOn(context.clients.cache, 'remove').mockImplementationOnce(async () => ({
        ok: true,
        id: 'foo'
      }))

      const res = await profile.onboardUser({
        data,
        by: { _id: cuid(), isAdmin: false }
      })
      expect(() => userSchema.parse(res)).not.toThrow()
    })

    test('it should bubble a GenericError', async () => {
      // error on query check
      vi.spyOn(context.clients.data, 'query').mockImplementationOnce(async () => ({
        ok: false as const,
        msg: 'woops',
        status: 400
      }))

      expect(() =>
        profile.onboardUser({
          data,
          by: { _id: cuid(), isAdmin: false }
        })
      ).rejects.toThrow(GenericError)

      vi.spyOn(context.clients.data, 'query').mockImplementationOnce(async () => ({
        ok: true,
        docs: []
      }))

      // error on document add
      vi.spyOn(context.clients.data, 'add').mockImplementationOnce(async () => ({
        ok: false as const,
        msg: 'oops'
      }))

      expect(() =>
        profile.onboardUser({
          data,
          by: { _id: cuid(), isAdmin: false }
        })
      ).rejects.toThrow(GenericError)
    })
  })

  describe('findColorTally', () => {
    test('it should find the color tally in cache', async () => {
      vi.spyOn(context.clients.cache, 'get').mockImplementationOnce(async () => ({
        ok: true,
        doc: {
          tally: 2,
          _ids: [cuid(), cuid()]
        }
      }))

      const res = await profile.findColorTally({ data: { color: 'blue' } })
      expect(() => colorTallySchema.parse(res)).not.toThrow()
    })

    test('it should calculate the color tally and cache', async () => {
      vi.spyOn(context.clients.cache, 'get').mockImplementationOnce(async () => ({
        ok: false as const,
        status: 404
      }))

      vi.spyOn(context.clients.cache, 'set').mockImplementationOnce(async () => ({
        ok: true
      }))

      const res = await profile.findColorTally({ data: { color: 'blue' } })
      expect(() => colorTallySchema.parse(res)).not.toThrow()
    })
  })
})

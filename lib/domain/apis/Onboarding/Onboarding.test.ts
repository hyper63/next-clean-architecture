import { describe, expect, test, vi } from 'vitest'
import cuid from 'cuid'
import { connect } from 'hyper-connect'

import { GenericError, UserAlreadyExistsError } from '../../../domain/models/err'
import { userSchema } from '../../../domain/models/user'

import { Onboarding } from './Onboarding'

const context = {
  clients: {
    hyper: connect('http://mock.hyper.io/test')
  }
}

describe('Onboarding', () => {
  // @ts-ignore
  const onboarding = new Onboarding(context)

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

      const by = cuid()
      const parent = cuid()
      const newUser = { email: 'foo@foo.com', parent }

      const res = await onboarding.onboardUser({ data: newUser, by: { _id: by, isAdmin: false } })
      expect(() => userSchema.parse(res)).not.toThrow()
      expect(res).toMatchObject({
        email: newUser.email,
        createdBy: by,
        updatedBy: by
      })
    })

    test('it should throw an error if the user already exists', async () => {
      vi.spyOn(context.clients.hyper.data, 'query').mockImplementationOnce(async () => ({
        ok: true,
        docs: [{ _id: 'foo' }]
      }))

      expect(() =>
        onboarding.onboardUser({
          data: { email: 'foo@foo.com' },
          by: { _id: cuid(), isAdmin: false }
        })
      ).rejects.toThrow(UserAlreadyExistsError)
    })

    test('it should bubble a GenericError', async () => {
      // error on query check
      vi.spyOn(context.clients.hyper.data, 'query').mockImplementationOnce(async () => ({
        ok: false as const,
        msg: 'woops',
        status: 400
      }))

      expect(() =>
        onboarding.onboardUser({
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
        onboarding.onboardUser({
          data: { email: 'foo@foo.com' },
          by: { _id: cuid(), isAdmin: false }
        })
      ).rejects.toThrow(GenericError)
    })
  })
})

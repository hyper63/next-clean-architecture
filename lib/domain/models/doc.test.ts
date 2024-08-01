import { describe, expect, test } from 'vitest'
import cuid from 'cuid'
import z from 'zod'

import { create, docSchema, get, update } from './doc'

describe('model', () => {
  describe('docSchema', () => {
    test('should require the document fields', () => {
      const valid = {
        _id: cuid(),
        type: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      expect(() => docSchema.parse(valid)).not.toThrow()

      expect(() => docSchema.parse({ ...valid, _id: null })).toThrow()
      expect(() => docSchema.parse({ ...valid, type: null })).toThrow()
      expect(() => docSchema.parse({ ...valid, createdAt: null })).toThrow()
      expect(() => docSchema.parse({ ...valid, updatedAt: null })).toThrow()
    })

    test('should allow other fields on the document', () => {
      const valid = {
        _id: cuid(),
        type: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
        foo: 'bar'
      }

      expect((docSchema.parse(valid) as any).foo).toBeTruthy()
    })

    test('should NOT allow other fields on the document', () => {
      // Overriding passthrough()
      const schema = docSchema
        .extend({
          fizz: z.string().min(1)
        })
        .strip()

      const valid = {
        _id: cuid(),
        type: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
        foo: 'bar',
        fizz: 'fuzz'
      }

      // @ts-expect-error
      expect(schema.parse(valid).foo).toBeFalsy()
      expect(schema.parse(valid).fizz).toBeTruthy()
    })
  })

  describe('get', () => {
    test('should parse the doc', () => {
      const valid = {
        _id: cuid(),
        type: 'user',
        parent: cuid(),
        createdBy: cuid(),
        updatedBy: cuid()
      }

      expect(get(docSchema)(create(docSchema)(valid))).toBeTypeOf('object')

      const invalid = {
        _id: cuid(),
        no_type: 'user',
        parent: cuid(),
        createdBy: cuid(),
        updatedBy: cuid()
      }

      expect(() => get(docSchema)(invalid)).toThrow()
    })
  })

  describe('create', () => {
    test('should set the fields', () => {
      const valid = {
        _id: cuid(),
        type: 'user',
        email: 'foo@bar.com',
        parent: cuid(),
        createdBy: cuid(),
        updatedBy: cuid()
      }

      const doc = create(docSchema)(valid)

      expect(doc).toMatchObject({
        // ensures fields like _id are not overwritten if already set
        ...valid,
        updatedAt: expect.any(Date),
        createdAt: expect.any(Date)
      })
    })

    test('should parse the doc', () => {
      const valid = {
        _id: cuid(),
        type: 'user',
        parent: cuid(),
        createdBy: cuid(),
        updatedBy: cuid()
      }

      expect(create(docSchema)(valid)).toBeTypeOf('object')

      const invalid = {
        _id: cuid(),
        no_type: 'user',
        parent: cuid(),
        createdBy: cuid(),
        updatedBy: cuid()
      }

      expect(() => create(docSchema)(invalid)).toThrow()
    })

    test('should set _id if not already set', () => {
      const valid = {
        type: 'user',
        email: 'foo@bar.com',
        parent: cuid(),
        createdBy: cuid(),
        updatedBy: cuid()
      }

      const doc = create(docSchema)(valid)

      expect(doc).toMatchObject({
        _id: expect.any(String)
      })
    })
  })

  describe('update', () => {
    test('should set the fields', () => {
      const valid = {
        _id: cuid(),
        type: 'user',
        createdAt: new Date(),
        createdBy: cuid(),
        updatedBy: cuid()
      }

      const doc = update(docSchema)(valid)

      expect(doc).toMatchObject({
        // ensures fields like _id are not overwritten if already set
        ...valid,
        updatedAt: expect.any(Date)
      })
    })

    test('should parse the doc', () => {
      const valid = {
        _id: cuid(),
        no_type: 'user',
        parent: cuid(),
        createdAt: new Date(),
        createdBy: cuid(),
        updatedBy: cuid()
      }

      expect(() => update(docSchema)(valid)).toThrow()
    })
  })
})

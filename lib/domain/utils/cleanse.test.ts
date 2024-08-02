import { describe, expect, test } from 'vitest'

import { cleanseSecrets } from './cleanse'

describe('cleanseSecrets', () => {
  const mockConfig = {
    secret: 'asdfghjkl',
    foo: 'bar',
    authToken: '12345678',
    some: {
      token: 'ghj',
      privateSecretNum: 123456789,
      biz: 'baz',
      apiKeyPairs: {
        'one-api': '123',
        'two-api': '456'
      },
      headers: [
        {
          authorization: 'foo'
        }
      ]
    },
    arr: [1, 2, '123'],
    parseableJson: '{ "jwt": "eyF4k3-70k3n" }'
  }

  test('should correctly sanitize the object', () => {
    const sanitized = cleanseSecrets(mockConfig)

    expect(sanitized.foo).toBe(mockConfig.foo)
    expect(sanitized.secret).toBe('*****hjkl')
    expect(sanitized.authToken).toBe('*****5678')
    expect(sanitized.some.token).toBe('*****')
    expect(sanitized.some.privateSecretNum).toBe('*****6789')
    expect(sanitized.some.biz).toBe(mockConfig.some.biz)
    expect(sanitized.some.apiKeyPairs['one-api']).toBe('*****')
    expect(sanitized.some.headers[0].authorization).toBe('*****')
    expect(sanitized.arr).toEqual(mockConfig.arr)
    expect(sanitized.parseableJson).toStrictEqual({ jwt: '*****0k3n' })
  })

  test('should not throw on null value', () => {
    const mockConfig = {
      oops: {
        token: null,
        authorization: 'null'
      }
    }
    expect(() => cleanseSecrets(mockConfig)).not.toThrow()
  })

  test('should not follow circular references, and still cleanse the object', () => {
    const mockConfig: any = {
      oops: {
        token: '1234'
      }
    }

    // Circular reference to root
    mockConfig.key = mockConfig
    mockConfig.foo = mockConfig.key

    const sanitized = cleanseSecrets(mockConfig)

    expect(sanitized.oops.token).toBe('*****')
    expect(sanitized.key.oops.token).toBe('*****')
    expect(sanitized.foo.oops.token).toBe('*****')
  })

  test('should return undefined if obj is undefined', () => {
    // @ts-ignore
    expect(cleanseSecrets(undefined)).toBe(undefined)
  })
})

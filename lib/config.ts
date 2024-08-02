import { mergeDeepRight } from 'ramda'
import z from 'zod'

import { loggingFormatSchema, loggingLevelSchema } from './logger'

const environmentName = z.enum(['development', 'test', 'staging', 'production'])
export const EnvironmentName = environmentName.Enum

export const MODE = process.env['NODE_ENV'] as z.infer<typeof environmentName>

if (!MODE) throw new Error('NODE_ENV must be defined')

/**
 * We extend the domainConfig, so this will contain
 * all configuration for our presentation and our domain
 */
const environmentConfig = z.object({
  hyper: z.string().min(1),
  version: z.string(),
  mode: environmentName,
  isDevMode: z.boolean(),
  logging: z.object({
    level: loggingLevelSchema,
    format: loggingFormatSchema
  }),
  playground: z.boolean()
})
const partialEnvironmentConfig = environmentConfig.deepPartial()

const commonConfig = environmentConfig.deepPartial().parse({
  version: process.env['npm_package_version'],
  mode: MODE,
  isDevMode: MODE === 'development',
  logging: {
    level: process.env['LOG_LEVEL'] || loggingLevelSchema.Enum.debug,
    format: process.env['LOG_FORMAT'] || loggingFormatSchema.Enum.json
  },
  hyper: process.env['HYPER'],
  /**
   * Whether to enable the graphiql playground
   */
  playground: true
})

const allConfig = {
  development: partialEnvironmentConfig.parse({
    logging: {
      level: loggingLevelSchema.Enum.debug,
      format: loggingFormatSchema.Enum.pretty
    }
  }),
  test: partialEnvironmentConfig.parse({
    logging: {
      level: loggingLevelSchema.Enum.off
    }
  }),
  staging: {},
  production: partialEnvironmentConfig.parse({
    playground: false
  })
}

export const config = environmentConfig.parse(
  [commonConfig, allConfig[MODE]].reduce((acc, cur) => mergeDeepRight(acc, cur), {})
)
export type EnvironmentConfig = z.infer<typeof environmentConfig>

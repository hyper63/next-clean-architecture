import { mergeDeepRight } from 'ramda'
import z from 'zod'

import { environmentName, loggingLevelSchema } from './domain/config'
import { clientConfig } from './domain/effects/clients'

export const MODE = process.env['NODE_ENV'] as z.infer<typeof environmentName>

if (!MODE) throw new Error('NODE_ENV must be defined')

/**
 * We extend the clientConfig, so that this configuration
 * requires all configuration for:
 *
 * - Our presentation layer (driving side-effect)
 * - Our client implementations (driven side-effects)
 * - Our business domain
 *
 * Since this parses configuration as startup time, our application
 * will fail fast, if some required configuration is not provided,
 * which is what we want
 */
const environmentConfig = clientConfig.extend({
  playground: z.boolean()
})
const partialEnvironmentConfig = environmentConfig.deepPartial()

const commonConfig = environmentConfig.deepPartial().parse({
  version: process.env['npm_package_version'],
  mode: MODE,
  isDevMode: MODE === 'development',
  logging: {
    level: process.env['LOG_LEVEL'] || loggingLevelSchema.Enum.debug
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
      level: loggingLevelSchema.Enum.debug
    }
  }),
  test: partialEnvironmentConfig.parse({
    logging: {
      level: loggingLevelSchema.Enum.off
    }
  }),
  preview: {},
  production: partialEnvironmentConfig.parse({
    playground: false
  })
}

export const config = environmentConfig.parse(
  [commonConfig, allConfig[MODE]].reduce((acc, cur) => mergeDeepRight(acc, cur), {})
)
export type EnvironmentConfig = z.infer<typeof environmentConfig>

import { mergeDeepRight } from 'ramda'
import z from 'zod'

const environmentName = z.enum(['development', 'test', 'staging', 'production'])
export const EnvironmentName = environmentName.Enum

export const MODE = process.env['NODE_ENV'] as z.infer<typeof environmentName>

if (!MODE) {
  throw new Error('NODE_ENV must be defined')
}

const loggingFormatSchema = z.enum(['pretty', 'pretty_json', 'json'])
// convenience object for referencing valid logging format values
export const LoggingFormat = loggingFormatSchema.Enum

const loggingLevelSchema = z.enum(['off', 'error', 'warn', 'info', 'verbose', 'debug', 'silly'])
// convenience object for referencing valid logging level values
export const LoggingLevel = loggingLevelSchema.Enum

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
    level: process.env['LOG_LEVEL'] || LoggingLevel.debug,
    format: process.env['LOG_FORMAT'] || LoggingFormat.json
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
      level: LoggingLevel.debug,
      format: LoggingFormat.pretty_json
    }
  }),
  test: partialEnvironmentConfig.parse({
    logging: {
      level: LoggingLevel.off
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

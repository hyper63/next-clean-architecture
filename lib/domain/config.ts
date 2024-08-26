import z from 'zod'

export const environmentName = z.enum(['development', 'test', 'preview', 'production'])
export type EnvironmentName = z.infer<typeof environmentName>

export const loggingLevels = {
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
  silly: 5,
  off: 6
} as const

export const loggingLevelSchema = z.enum(['error', 'warn', 'info', 'verbose', 'debug', 'silly', 'off'])
export type LoggingLevel = z.infer<typeof loggingLevelSchema>

/**
 * Configuration needed for business logic ie.
 * domain feature flags, algorithm settings, etc.
 *
 * This should be separate from configuration
 * required for the presentation or services tier ie. session, routing, etc.
 */
export const domainConfig = z.object({
  version: z.string(),
  isDevMode: z.boolean(),
  mode: environmentName,
  logging: z.object({
    level: loggingLevelSchema
  })
})
export type DomainConfig = z.infer<typeof domainConfig>

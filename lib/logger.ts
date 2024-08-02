/* c8 ignore start */
import z from 'zod'
import winston from 'winston'

import { cleanseSecrets } from './domain/utils/cleanse'

const {
  format,
  transports: { Console: ConsoleTransport },
  createLogger
} = winston
const { combine, timestamp, json, prettyPrint } = format

export const loggingFormatSchema = z.enum(['pretty', 'json'])
// Be sure to update levels below in the createLogger() if you add another level here
export const loggingLevelSchema = z.enum(['error', 'warn', 'info', 'verbose', 'debug', 'silly', 'off'])

const getFormat = (format: z.infer<typeof loggingFormatSchema>) => {
  switch (format) {
    case 'pretty':
      return [prettyPrint()]
    default:
      return [json()]
  }
}

const loggingConfigSchema = z.object({
  isDevMode: z.boolean().default(false),
  logging: z.object({
    level: loggingLevelSchema.default('debug'),
    format: loggingFormatSchema.default('json')
  })
})
export type LoggingConfig = z.infer<typeof loggingConfigSchema>

export const createLoggerClient = (
  correlationId: string,
  _options: z.infer<typeof loggingConfigSchema>
) => {
  const { isDevMode, logging } = loggingConfigSchema.parse(_options)

  const options = {
    format: combine(
      timestamp(),
      format(({ level, message, ...meta }) =>
        isDevMode
          ? { level, message, correlationId, ...meta }
          : ({ level, correlationId, ...cleanseSecrets({ message, ...meta }) } as {
              level: string
              correlationId: string
              message: string
              [key: string]: any
            })
      )(),
      ...getFormat(logging.format)
    ),
    level: logging.level
  }

  return createLogger({
    // See https://github.com/winstonjs/winston#logging-levels
    levels: {
      [loggingLevelSchema.Enum.error]: 0,
      [loggingLevelSchema.Enum.warn]: 1,
      [loggingLevelSchema.Enum.info]: 2,
      [loggingLevelSchema.Enum.verbose]: 3,
      [loggingLevelSchema.Enum.debug]: 4,
      [loggingLevelSchema.Enum.silly]: 5
    },
    /**
     * Implement more transports here, as needed
     */
    transports: [new ConsoleTransport(options)],
    silent: logging.level === loggingLevelSchema.Enum.off
  })
}

export type Logger = ReturnType<typeof createLoggerClient>

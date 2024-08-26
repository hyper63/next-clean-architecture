/* c8 ignore start */
import winston from 'winston'

import { type EnvironmentName, type LoggingLevel, loggingLevelSchema, loggingLevels } from '../config'

const { format, transports, createLogger } = winston

function getFormats (env: EnvironmentName) {
  switch(env) {
    case 'development':
    case 'test':
    case 'preview':
    case 'production':
      return format.combine(
        format.timestamp(),
        format.splat(),
        format.printf(({ level, message, timestamp }) =>
          `${timestamp} [${level}]: ${message}`)
      )
  }
}

function getTransports (env: EnvironmentName) {
  switch(env) {
    case 'development':
    case 'test':
    case 'preview':
    case 'production':
      return [new transports.Console()]
  }
}

export const createLoggerClient = (
  correlationId: string,
  config: { mode: EnvironmentName, logging: { level: LoggingLevel }}
) => {
  const { mode, logging } = config

  const logger = createLogger({
    levels: loggingLevels,
    format: format.combine(
      format((meta) => {
        meta.correlationId = correlationId
        return meta
      })(),
      getFormats(mode)
    ),
    transports: getTransports(mode),
    level: logging.level,
    silent: logging.level === loggingLevelSchema.Enum.off
  })

  return logger
}

export type Logger = ReturnType<typeof createLoggerClient>

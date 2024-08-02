import { connect } from 'hyper-connect'
import { fetch } from 'undici'
import cuid from 'cuid'

import { type LoggingConfig, createLoggerClient } from '../../logger'

export type ClientConfig = { hyper: string } & LoggingConfig

export const createClients = (config: ClientConfig) => ({
  ...connect(config.hyper),
  /**
   * Logging is a side effect, and thus should be injected just like
   * any other side effect
   */
  logger: createLoggerClient(cuid(), config),
  fetch
})

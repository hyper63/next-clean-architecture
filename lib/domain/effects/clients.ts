import { z } from 'zod'
import { connect } from 'hyper-connect'
import { fetch } from 'undici'
import cuid from 'cuid'

import { createLoggerClient } from './logger'
import { domainConfig } from '../config'

/**
 * The client config extends the domainConfig (depends on it),
 * while requiring additional configuration for side-effects
 * like 3rd party api keys.
 *
 * In this way, the client can be shaped by the domain configuration
 * without being part of the domain itself (dependencies still go in towards the domain)
 */
export const clientConfig = domainConfig.extend({
  hyper: z.string().min(1)
})
export type ClientConfig = z.infer<typeof clientConfig>

/**
 * Despite not being part of the domain, clients builder is kept here
 * for the sake of convenience and simpler types (see DomainContext)
 */
export const createClients = (config: z.infer<typeof clientConfig>) => ({
  ...connect(config.hyper),
  /**
   * Logging is a side effect, and thus should be injected just like
   * any other side effect
   */
  logger: createLoggerClient(cuid(), config),
  fetch
})

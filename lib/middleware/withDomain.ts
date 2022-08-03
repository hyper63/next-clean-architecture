import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  NextApiHandler,
  NextApiRequest,
  NextApiResponse
} from 'next'

import { config, EnvironmentConfig } from '../config'

import { createApis } from '../domain/apis'
import { createClients } from '../domain/clients'
import { domainConfig } from '../domain/config'
import { createDataloaders } from '../domain/dataloaders'
import type { DomainContext } from '../domain/types'

/**
 * This is the dirty component, that bootstraps
 * our domains with the side effects, ie. clients, dataloaders, and configuration
 *
 * This can be thought of as the IoC container, that knows
 * all of the dirty details about what each component needs and supplies
 * it via dependency injection.
 *
 * In unit tests, this bootstrapping can be stubbed, allowing for each
 * component to be unit tested independently, regardless of framework
 */
function bootstrap(config: EnvironmentConfig): DomainContext {
  /**
   * Bootstrap side-effects. They also use dependency injection,
   * so also can be unit tested easily, but contract tests are more important here,
   * as all of the business logic belongs in business apis.
   */
  const sideEffects: any = {}
  sideEffects.clients = createClients({ hyper: config.hyper })
  // dataloaders may reference to each other and clients, but not apis
  sideEffects.dataloaders = createDataloaders(sideEffects)

  /**
   * Now side-effects are bootstrapped. Now inject side effects into business logic
   */

  const domain = { ...sideEffects }
  // Pull values off of environment config to produce the configuration for the domain
  domain.config = domainConfig.parse({})
  // apis may reference each other, domain config, dataloaders, and clients
  domain.apis = createApis(domain)
  return domain as DomainContext
}

export function withDomain(handler: NextApiHandler): NextApiHandler {
  return (req: NextApiRequest, res: NextApiResponse) => {
    req.config = config
    req.domain = bootstrap(config)
    return handler(req, res)
  }
}

export function withDomainSsr(handler: GetServerSideProps) {
  return (context: GetServerSidePropsContext) => {
    context.req.config = config
    context.req.domain = bootstrap(config)
    return handler(context)
  }
}

/**
 * Extend the root types extended by Next Requests
 * to include the DomainContext and Configuration on Next Requests. Sort of hack imo,
 * but seems to be a convention
 *
 * Similar to what IronSession does
 * See node_modules/iron-session/dist/index.d.ts
 */
declare module 'http' {
  interface IncomingMessage {
    config: EnvironmentConfig
    domain: DomainContext
  }
}

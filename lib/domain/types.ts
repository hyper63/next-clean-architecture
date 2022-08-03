import { createApis } from './apis'
import { createClients } from './clients'
import type { DomainConfig } from './config'
import { createDataloaders } from './dataloaders'

export type DomainContext = {
  config: DomainConfig
  apis: ReturnType<typeof createApis>
  /**
   * These are entrypoints to side effects, technically not part of domain
   * but exposed on domain context, for the sake of making bootstrapping
   * dependencies in each business api easier.
   */
  clients: ReturnType<typeof createClients>
  dataloaders: ReturnType<typeof createDataloaders>
}

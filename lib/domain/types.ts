import { createApis } from './apis'
import type { DomainConfig } from './config'
import { EffectsContext } from './effects/effects'

export type DomainContext = EffectsContext & {
  config: DomainConfig
  apis: ReturnType<typeof createApis>
}

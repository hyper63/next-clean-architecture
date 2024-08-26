import type { DomainConfig } from './config'
import { createApis } from './apis/apis'
import { EffectsContext } from './effects/effects'

export type DomainContext = EffectsContext & {
  config: DomainConfig
  apis: ReturnType<typeof createApis>
}

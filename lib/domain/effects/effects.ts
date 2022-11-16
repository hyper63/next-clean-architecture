import { ClientConfig, createClients } from './clients'
import { createDataloaders, DataloaderConfig } from './dataloaders'

export type EffectsContext = {
  config: ClientConfig & DataloaderConfig
  clients: ReturnType<typeof createClients>
  dataloaders: ReturnType<typeof createDataloaders>
}

/**
 * Bootstrap side-effects. They also use dependency injection,
 * so also can be unit tested easily, but contract tests are more important here,
 * as all of the business logic belongs in apis.
 */
export const createEffects = (config: EffectsContext['config']) => {
  const effects: any = {}
  effects.config = config
  effects.clients = createClients(config)
  effects.dataloaders = createDataloaders(effects)
  return effects as EffectsContext
}

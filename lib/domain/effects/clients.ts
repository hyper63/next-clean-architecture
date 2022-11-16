import { connect } from 'hyper-connect'
import { fetch } from 'undici'

export type ClientConfig = { hyper: string }

export const createClients = (config: ClientConfig) => ({
  hyper: connect(config.hyper),
  fetch
})

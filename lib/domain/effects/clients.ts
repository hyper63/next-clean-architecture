import { connect } from 'hyper-connect'
import { fetch } from 'undici'

export type ClientConfig = { hyper: string }

export const createClients = (config: ClientConfig) => ({
  ...connect(config.hyper),
  fetch
})

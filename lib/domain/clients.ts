import { connect } from 'hyper-connect'

export const createClients = ({ hyper }: { hyper: string }) => ({
  hyper: connect(hyper)
})

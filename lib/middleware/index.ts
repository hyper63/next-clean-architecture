import { compose } from 'ramda'
import { GetServerSideProps, NextApiHandler } from 'next'

import { withDomain, withDomainSsr } from './withDomain'
import { withCors } from './withCors'

export function withMiddleware(handler: NextApiHandler): NextApiHandler {
  return compose(withDomain)(handler)
}

export function withMiddlewareSsr(handler: GetServerSideProps): GetServerSideProps {
  return compose(withDomainSsr)(handler)
}

export { withDomain, withDomainSsr, withCors }

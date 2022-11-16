import { compose } from 'ramda'
import { NextApiRequest, NextApiResponse } from 'next'
import {
  shouldRenderGraphiQL,
  renderGraphiQL,
  processRequest,
  getGraphQLParameters,
  sendResult,
  type Request
} from 'graphql-helix'

import { ResolverContext } from '../../lib/graphql/resolvers'
import { schema } from '../../lib/graphql/schema'
import { withCors, withMiddleware } from '../../lib/middleware'

const handler = async (req: NextApiRequest): Promise<(res: NextApiResponse) => void> => {
  const request: Request = {
    body: req.body,
    headers: req.headers,
    method: req.method || 'GET',
    query: req.query
  }

  if (shouldRenderGraphiQL(request)) {
    if (!req.config.playground) {
      return (res) => res.status(405).send('Method Not Allowed')
    }
    return (res) => res.send(renderGraphiQL({ endpoint: '/api/graphql' }))
  }

  const context: ResolverContext = req

  // Validate and execute the query
  const result = await processRequest({
    ...getGraphQLParameters(request),
    // We inject dependencies into GraphQL resolvers via context
    contextFactory: () => context,
    request,
    schema: await schema
  })

  return (res) => sendResult(result, res)
}

export default compose(
  withCors(),
  withMiddleware
)(async (req, res) => {
  const sendWith = await handler(req)
  return sendWith(res)
})

import { NextApiHandler } from 'next'
import z from 'zod'

const DEFAULT_ALLOW_METHODS = ['POST', 'GET', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as const

const DEFAULT_ALLOW_HEADERS = [
  'X-Requested-With',
  'Access-Control-Allow-Origin',
  'X-HTTP-Method-Override',
  'Content-Type',
  'Authorization',
  'Accept'
] as const

const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 // 24 hours

const corsOptionsSchema = z.object({
  origin: z.string().optional(),
  maxAge: z.number().optional(),
  allowMethods: z.array(z.enum(DEFAULT_ALLOW_METHODS)).optional(),
  allowHeaders: z.array(z.enum(DEFAULT_ALLOW_HEADERS)).optional(),
  allowCredentials: z.boolean().optional(),
  exposeHeaders: z.array(z.string()).optional()
})

const withCors =
  (options: z.infer<typeof corsOptionsSchema> = {}) =>
  (handler: NextApiHandler): NextApiHandler =>
  (req, res, ...restArgs) => {
    const {
      origin = '*',
      maxAge = DEFAULT_MAX_AGE_SECONDS,
      allowMethods = DEFAULT_ALLOW_METHODS,
      allowHeaders = DEFAULT_ALLOW_HEADERS,
      allowCredentials = true,
      exposeHeaders = []
    } = corsOptionsSchema.parse(options)

    if (res && res.writableEnded) {
      return
    }

    res.setHeader('Access-Control-Allow-Origin', origin)
    if (allowCredentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true')
    }
    if (exposeHeaders.length) {
      res.setHeader('Access-Control-Expose-Headers', exposeHeaders.join(','))
    }

    const preFlight = req.method === 'OPTIONS'
    if (preFlight) {
      res.setHeader('Access-Control-Allow-Methods', allowMethods.join(','))
      res.setHeader('Access-Control-Allow-Headers', allowHeaders.join(','))
      res.setHeader('Access-Control-Max-Age', String(maxAge))
    }

    return handler(req, res, ...restArgs)
  }

export { withCors }

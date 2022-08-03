import z from 'zod'

/**
 * Configuration needed for business logic ie.
 * domain feature flags, algorithm settings, etc.
 *
 * This should be separate from configuration
 * required for the presentation or framework ie. session, routing, etc.
 */
export const domainConfig = z.object({})
export type DomainConfig = z.infer<typeof domainConfig>

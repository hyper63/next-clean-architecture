import z, { ZodSchema } from 'zod'
import { assoc, compose, identity } from 'ramda'
import cuid from 'cuid'

export const typeSchema = z.enum(['user'])
export type Type = z.infer<typeof typeSchema>

export const idSchema = z.string().cuid()
export type Id = z.infer<typeof idSchema>

export const emailSchema = z
  .string()
  .email()
  .transform((val) => val.toLowerCase())
export type Email = z.infer<typeof emailSchema>

export const dateSchema = z.preprocess(
  (arg) => (typeof arg == 'string' || arg instanceof Date ? new Date(arg) : arg),
  z.date()
)

// A generic doc schema all of our docs in hyper data will adhere to
export const docSchema = z
  .object({
    _id: idSchema,
    type: typeSchema,
    createdAt: dateSchema,
    updatedAt: dateSchema,
    // Whether the document is a seed document or not.
    isSeed: z.boolean().optional()
  })
  .passthrough()
export type Doc = z.infer<typeof docSchema>

// Setters
export const addType = (type: Type) => assoc('type', type)
export const addUnderscoreId = (doc: Record<string, unknown>) => assoc('_id', cuid(), doc)
export const addCreatedBy = (by: string) => (doc: Record<string, unknown>) =>
  assoc('createdBy', by)(doc)
export const addUpdatedBy = (by: string) => (doc: Record<string, unknown>) =>
  assoc('updatedBy', by)(doc)

// To and From DB Utilities

const _fromDb: any = identity
// take an additional schema and further parse the object
_fromDb.as = <ds extends ZodSchema>(schema: ds) => compose((o) => schema.parse(o), _fromDb)

export const fromDb: {
  (o: any): typeof o
  as: <s extends ZodSchema>(schema: s) => (o: any) => z.infer<s>
} = _fromDb

/**
 * - set updatedAt to now
 * - parse to ensure doc has all required fields
 */
const _toDb: any = compose(
  // ensure all required fields are present
  (model) => docSchema.parse(model),
  (model) => assoc('updatedAt', new Date(), model)
)
// take an additional schema and further parse the document
_toDb.as = <ds extends ZodSchema>(ds: ds) => compose((doc) => ds.parse(doc), _toDb)

export const toDb: {
  (o: any): z.infer<typeof docSchema>
  as: <ds extends ZodSchema>(docSchema: ds) => (o: any) => z.infer<ds>
} = _toDb

// Document Crud Utilities

/**
 * Given a document schema, returns a function that
 * given an object will add necessary document
 * fields like _id, timestamps, etc., and then
 * parse the result for correctness based on the provided document schema.
 *
 * ie. create(userSchema)(obj) will construct and return a userObject that can be persisted
 *
 * @param schema - the ZodSchema that extends docSchema that will be used to parse the document
 * @returns - a parsed and validated document ready to send to the database
 */
export const create = <ds extends ZodSchema>(schema: ds): ((o: any) => z.infer<ds>) =>
  compose(
    toDb.as(schema),
    (model) => assoc('createdAt', model.createdAt || new Date(), model),
    (model: Record<string, unknown>) => (model._id ? model : addUnderscoreId(model))
  )

/**
 * Given a schema, returns a function that
 * given a document will parse the result for correctness
 * based on the provided schema.
 *
 * ie. get(userSchema)(doc) will construct and return a userObject
 *
 * @param schema - the ZodSchema that will be used to parse the document
 * @returns - a parsed and validated object
 */
export const get = <ds extends ZodSchema>(schema: ds): ((o: any) => z.infer<ds>) =>
  compose(fromDb.as(schema))

/**
 * Given a document schema, returns a function that
 * given an object will update necessary document
 * fields like timestamps, etc., and then
 * parse the result for correctness based on the provided document schema.
 *
 * ie. update(userSchema)(obj) will construct and return a userObject that can be persisted
 *
 * @param schema - the ZodSchema that will be used to parse the document
 * @returns - a parsed and validated document ready to send to the database
 */
export const update = <ds extends ZodSchema>(schema: ds): ((o: any) => z.infer<ds>) =>
  compose(toDb.as(schema))

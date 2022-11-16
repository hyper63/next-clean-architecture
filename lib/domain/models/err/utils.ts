/* c8 ignore start */
import * as Err from './err'

/**
 * Used to build out GraphQL Error types programmatically
 */
export const TypedErrorConstructorNames = Object.keys(Err)
  // see https://thewebdev.info/2021/07/29/how-to-check-if-a-javascript-function-is-a-constructor/
  .filter((name: any) => {
    const handler = {
      construct() {
        return handler
      }
    }

    try {
      return !!new new Proxy(Err[name as keyof typeof Err], handler)()
    } catch (e) {
      return false
    }
  })

export function toTypedErr(err: any): Err.TypedError {
  const c = TypedErrorConstructorNames.find((c) => err instanceof Err[c as keyof typeof Err])
  return c ? err : new Err.GenericError(err.message || err.msg || err)
}

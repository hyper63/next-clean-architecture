import clone from 'rfdc'

// TODO: Move to configuration
const defaultBlacklist = [
  /jwt/,
  /token/,
  /secret/,
  /password/,
  /private/,
  /auth(orization)?/,
  /cookie/,
  /key/,
  /email/
]

const maskString = (str: string) => {
  str = `${str}`
  if (str.length <= 5) return '*****'

  const sub = str.slice(-4)
  return `*****${sub}`
}

const tryParseJson = (value: any) => {
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch (_) {
    return value
  }
}

/**
 * Cleanse an object, given a set of blacklisted keys using the following algorithm:
 *    if a key is blacklisted:
 *    if value is a string, mask value
 *    else traverse and mask every value under key (object or array)
 *   else do nothing with value
 *
 * Didn't use recursion because objects could be arbitrarily deep
 * which could exceed max call stack.
 *
 * @param obj - the object to cleanse
 * @param blacklist - the list of blacklisted keys
 */
export const cleanseSecrets = (obj: Record<string, any>, blacklist = defaultBlacklist) => {
  /**
   * track each object that is visited. Doing so
   * prevents traversing circular references
   */
  const visited = []

  if (!obj) return obj

  // the eventually cleansed config
  const cleansed = clone({
    proto: true,
    circles: true
  })(obj)
  const stack = [{ parent: cleansed, key: '', doCleanse: false }]
  while (stack.length) {
    const { parent, key, doCleanse } = stack.pop() as {
      parent: Record<string, any>
      key: string
      doCleanse: boolean
    }

    let cur = key ? parent[key] : parent

    /**
     * Parse stringified JSON without losing ref to parent
     */
    const parsedCur = tryParseJson(cur)
    if (key && cur && typeof parsedCur === 'object') {
      cur = parsedCur
      parent[key] = cur
    }

    // base case
    if (!cur || typeof cur !== 'object') {
      if (cur && doCleanse) parent[key] = maskString(cur)
      continue
    }

    /**
     * We've already visited this object,
     * and pushed any children onto the stack,
     * so skip it
     */
    if (visited.indexOf(cur) !== -1) continue

    // Mark this object as visited
    visited.push(cur)

    // Push each node onto the stack. This works for both Objects and Arrays.
    Object.keys(cur).forEach((key) => {
      // cleanse if parent is being cleansed or if current key is in blacklist
      const nextDoCleanse = doCleanse || !!blacklist.find((regex) => regex.test(key.toLowerCase()))
      stack.push({ parent: cur, key, doCleanse: nextDoCleanse })
    })
  }

  return cleansed
}

/* c8 ignore start */

import { Profile } from './Profile/Profile'
import { User } from './User/User'

/**
 * All business logic apis are instantiated here
 */
export const createApis = (context: any) => ({
  Profile: new Profile(context),
  User: new User(context)
})

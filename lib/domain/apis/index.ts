import { Onboarding } from './Onboarding/Onboarding'

/**
 * All business logic apis are instantiated here
 */
export const createApis = (context: any) => ({
  Onboarding: new Onboarding(context)
})

/* c8 ignore start */

/**
 * Domain specific errors. These should be used in Domain services
 * and can also be used to generate DomainSpecific Errors ie.
 * in GraphQL schema
 */

export interface TypedError {
  status: number
  type: string
}

export class UserNotFoundError extends Error implements TypedError {
  public status = 404
  public type = 'UserNotFound'
  public static type = 'UserNotFound'
  public static description = 'An error type that indicates the User could not be found'
  constructor(message?: string) {
    super(message)
    this.message = this.message || 'User Not Found'
  }
}

export class UserAlreadyExistsError extends Error implements TypedError {
  public status = 409
  public type = 'UserAlreadyExists'
  public static type = 'UserAlreadyExists'
  public static description =
    'An error type that indicates the user already exists, which usually indicates a User with a certain email already exists'
  constructor(message?: string) {
    super(message)
    this.message = this.message || 'User Already Exists'
  }
}

export class GenericError extends Error implements TypedError {
  public status = 500
  public type = 'GenericError'
  public static type = 'GenericError'
  public static description = 'A catch all error type which indicates an unknown error occurred'
  constructor(message?: string) {
    super(message)
    this.message = this.message || 'Generic Error'
  }
}

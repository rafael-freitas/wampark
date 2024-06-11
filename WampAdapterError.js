import ErrorTypes from './ErrorTypes.js'
import ApplicationError from './ApplicationError.js'

export default class WampAdapterError extends ApplicationError {
  family = 'WAMP'
  type = ErrorTypes.CONNECTION
}

import ErrorTypes from '../errors/ErrorTypes.js'
import ApplicationError from '../errors/ApplicationError.js'


// const { ErrorTypes, ApplicationError } = errors

export default class WampAdapterError extends ApplicationError {
  constructor () {
    super(...arguments)
    this.setFamily('WAMPADT')
    this.type = ErrorTypes.CONNECTION
  }
}

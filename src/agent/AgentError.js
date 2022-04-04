import ErrorTypes from '../errors/ErrorTypes.js'
import ApplicationError from '../errors/ApplicationError.js'

export default class AgentError extends ApplicationError {
  constructor () {
    super(...arguments)
    this.setFamily('AGNTS')
    this.type = ErrorTypes.RUNTIME
  }
}

import { ErrorTypes, ApplicationError } from '../errors'

export default class AgentError extends ApplicationError {
  constructor () {
    super(...arguments)
    this.setFamily('AGNTS')
    this.type = ErrorTypes.RUNTIME
  }
}

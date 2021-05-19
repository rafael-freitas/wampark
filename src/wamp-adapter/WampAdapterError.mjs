import errors from '../errors'

const { ErrorTypes, ApplicationError } = errors

export default class WampAdapterError extends ApplicationError {
  constructor () {
    super(...arguments)
    this.setFamily('WAMPADT')
    this.type = ErrorTypes.CONNECTION
  }
}

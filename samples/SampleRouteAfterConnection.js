
import Route from "../Route.js"
import ApplicationError from "../ApplicationError.js"


export default class SampleRouteAfterConnection extends Route {

  constructor () {
    super({
      type: Route.RouteTypes.RPC,
      uri: 'routes.sampleRouteAfterConnection'
    })
  }

  /**
   * @ignore
   * @param args
   * @param kwargs
   * @param details
   */
  async endpoint (args = [], kwargs = {}, details = {}) {
    // ApplicationError.assert(false, 'A001: teste de erro')
    // throw new ApplicationError('A002: teste de erro da aplicacao')
    // throw new Error('teste de erro')
  }
}
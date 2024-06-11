
import Route from "../Route.js"

export default class CallMyRouteSample extends Route {

  static settings = {
    type: Route.RouteTypes.RPC,
    uri: 'routes.callMyRouteSample'
  }

  /**
   * @ignore
   * @param args
   * @param kwargs
   * @param details
   */
  async endpoint ({args = [], kwargs = {}, details = {}}) {
    let result = await this.session.call('routes.myRouteSample', [], {a: 29, b: 82})
    let result2 = await this.session.call('routes.myRouteSample', [], {a: 29, b: 82})
    console.log('routes.myRouteSample =>', result, result2, details)
  }
}
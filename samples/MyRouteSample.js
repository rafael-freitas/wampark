
import Route from "../Route.js"

export default class MyRouteSample extends Route {

  constructor () {
    super({
      type: Route.RouteTypes.RPC,
      uri: 'routes.myRouteSample'
    })
  }

  /**
   * @ignore
   * @param args
   * @param kwargs
   * @param details
   */
  async endpoint (args = [], kwargs = {}, details = {}) {
    const { a, b } = kwargs
    return 1 + a + b
  }
}
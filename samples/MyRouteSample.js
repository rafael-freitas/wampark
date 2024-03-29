
import application from '../src/index.js'

export default class MyRouteSample extends application.Route {
  constructor () {
    super({
      type: application.RouteTypes.RPC,
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
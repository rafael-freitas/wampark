
import application from '../src/index'

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
    const { data, schema } = kwargs
    return 1
  }
}
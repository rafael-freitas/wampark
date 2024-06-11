
import Route from "../Route.js"

export default class MyRouteSample extends Route {

  static settings = {
    type: Route.RouteTypes.RPC,
    uri: 'routes.myRouteSample'
  }

  static count = 0

  /**
   * @ignore
   * @param args
   * @param kwargs
   * @param details
   */
  async endpoint ({args = [], kwargs = {}, details = {}}) {
    const { a, b } = kwargs
    MyRouteSample.count++
    console.log('this.count', MyRouteSample.count)
    return MyRouteSample.count + a + b
  }
}
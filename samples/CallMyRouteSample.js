
import Route from "../Route.js"

const snooze = ms => new Promise(resolve => setTimeout(resolve, ms))

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

    console.log('snooze a little')
    await snooze(2000)

    console.log('calling')

    let result = await this.session.call('routes.myRouteSample', [], {a: 29, b: 82})

    console.log('result ok')

    // let result2 = await this.session.call('routes.myRouteSample', [], {a: 29, b: 82})
    console.log('routes.myRouteSample =>', result, details)
  }
}

import ApplicationError from "../ApplicationError.js"
import Route from "../Route.js"
import { Worker, isMainThread, parentPort, workerData, threadId } from 'worker_threads'

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
    console.log(`[worker ${threadId}]`,'snooze a little')

    // throw new ApplicationError('endpoint.A001: erro de teste')

    // await snooze(2000)

    return b + 1
    // console.log('[MyRouteSample] this.count', MyRouteSample.count)

    // return MyRouteSample.count + a + b
  }
}
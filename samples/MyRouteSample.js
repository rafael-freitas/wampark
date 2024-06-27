
import ApplicationError from "../ApplicationError.js"
import Route from "../Route.js"
import { Worker, isMainThread, parentPort, workerData, threadId } from 'worker_threads'
import RouteTypes from "../RouteTypes.js"

export default class MyRouteSample extends Route {

  static {
    this.uri = 'routes.myRouteSample'
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

    this.constructor.log.warn(`Snooze a little`)

    // console.log(`[worker ${threadId}]`,'snooze a little')

    // this.constructor.log.info('teste de log -> ' + this.constructor.uri)

    // throw new ApplicationError('endpoint.A001: erro de teste')

    // await snooze(2000)

    return b + 1
    // console.log('[MyRouteSample] this.count', MyRouteSample.count)

    // return MyRouteSample.count + a + b
  }
}
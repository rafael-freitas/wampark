import ApplicationError from "../ApplicationError.js"

import { Worker, isMainThread, parentPort, workerData, threadId } from 'worker_threads'
import Route from "../Route.js"

const snooze = ms => new Promise(resolve => setTimeout(resolve, ms))

export default class CallMyRouteSample extends Route {

  static {
    this.uri = 'routes.callMyRouteSample'
    this.type = Route.RouteTypes.RPC
  }
  
  /**
   * @ignore
   * @param args
   * @param kwargs
   * @param details
   */
  async endpoint ({args = [], kwargs = {}, details = {}}) {

    // console.log(`[worker ${threadId}]`,'snooze a little')

    // console.log(`[worker ${threadId}]`, 'calling', kwargs.counter)

    // throw new ApplicationError('endpoint.A001: erro de teste')

    let result = await this.session.call('routes.myRouteSample', [], {a: 0, b: kwargs.counter})

    const {log} = this.constructor

    // console.log(`[worker ${threadId}]`,'result ok')

    // let result2 = await this.session.call('routes.myRouteSample', [], {a: 29, b: 82})
    log.info(`Counter = ${log.yellow(result)}`)
    return result
  }
}
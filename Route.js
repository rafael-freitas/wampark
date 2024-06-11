
/**
* ******************************************************************************************************
*
*   Route
*
*     Classe de rota para protocolo WAMP com Autobahn
*     Todas as rotas devem herdar de Route
*
*
*   @author     Rafael Freitas
*   @date       Feb 03 2018
*   @update     Apr 22 2018 by Rafael
*   @update     2024-06-10 00:13:12 by Rafael
*
*   @class Route
*   @memberof module:lib/routes
*   @requires {@link module:lib/routes.RouteTypes}
*
* ******************************************************************************************************
*/
import { v1 as uuid } from 'uuid'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import logger from './logger/index.js'
import normalizeError from './errors/normalize.js'
import ApplicationError from './ApplicationError.js'
import RouteTypes from './RouteTypes.js'
import application from './Application.js'
import Component from './Component.js'
import RequestContainer from './RequestContainer.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// const WORKERS_MAX = process.env.WORKERS_MAX || os.cpus().length
const WORKERS_AWAIT_MAX_ATTEMPTS = 2
const WORKERS_AWAIT_TIMEOUT = 10


const snooze = ms => new Promise(resolve => setTimeout(resolve, ms))


export default class Route {

  static RouteTypes = RouteTypes

  /**
   * Configurações da rota
   * @private
   */
  settings = {
    /**
     * URI da rota
     */
    uri: undefined,
    /**
     * Tipo da rota - RPC, PUBSUB, POST, GET...
     */
    type: RouteTypes.RPC,
    /**
     * Opções de registro da rota
     */
    options: {}
  }

  constructor (settings = {}) {

    Object.assign(this.settings, settings)

    if (!this.settings.uri) {
      throw new ReferenceError('Setting "uri" is required', __filename)
    }
  }

  /**
   * @method logger
   */
  createLogger (name) {
    return logger(name || this.settings.uri || this.constructor.name)
  }


  /**
   * endpoint - Attached method to crossbar session that will response the call
   *
   * ```js
   * Route.attach(session)
   * // the same that:
   * session.register(route.uri, route.endpoint, route.options)
   * ```
   *
   * @memberof module:lib/routes.Route
   * @method endPoint
   * @instance
   * @param {Array} args    Description
   * @param {Object} kwargs  Description
   * @param {Object} details Description
   * @returns {Promise}
   */
  async endpoint (args = [], kwargs = {}, details = {}) {

  }

  attach (session) {

    this.setSession(session)
    
    const {settings} = application

    if (settings.use_worker_threads) {
      this.registerWorker()
    }
    else {
      this.registerEndpoint()
    }

  }

  createRequestContainer () {
    return new RequestContainer(this)
  }

  registerEndpoint () {
    const {session} = this
    const {uri, type, options} = this.settings

    const wrappedEndpoint = this.createWrappedEndpoint.bind(this)

    if (type === RouteTypes.RPC) {
      session.register(uri, wrappedEndpoint, options)
        .then(this.onAttachSuccess.bind(this))
        .then(this.printLogAttachSuccess.bind(this))
        .catch(this.onAttachFail.bind(this))
        .catch(this.printLogAttachFail.bind(this))
    }
    else {
      if (type === RouteTypes.PUBSUB) {
        session.subscribe(uri, wrappedEndpoint, options)
          .then(this.onAttachSuccess.bind(this))
          .then(this.printLogAttachSuccess.bind(this))
          .catch(this.onAttachFail.bind(this))
          .catch(this.printLogAttachFail.bind(this))
      }
    }
  }


  /**
   * createWrappedEndpoint - Captura erros e normaliza antes de retornar para engine do crossbar
   *
   * @param {array} args Description
   *
   * @returns {type} Description
   */
  createWrappedEndpoint (...args) {
    return new Promise((resolve, reject) => {
      try {
        const result = this.endpoint(...args)
        if (typeof result !== 'undefined' && ((result instanceof Promise || result !== null) && typeof result.then === 'function')) {
          result.then(resolve).catch((err) => {
            // add toJSON()
            normalizeError(err)
            reject(err)
          })
        }
      } catch (err) {
        normalizeError(err)
        reject(err)
      }
    })
  }

  /**
   * Register or subscribe this route into a session
   * @param session Autobahn session
   */
  setSession (session) {
    
    ApplicationError.assert(session, 'setSession.E001: Session not found')

    this.session = session
  }

  /**
   * @memberof module:lib/routes.Route
   * @method onAttachSuccess
   * @instance
   * @param {Object} result
   * @return {Object}
   */
  async onAttachSuccess (result) {
    return result
  }

  /**
   * @memberof module:lib/routes.Route
   * @method onAttachFail
   * @instance
   * @param {Object} err
   */
  onAttachFail (err) {
    return Promise.reject(err)
  }

  /**
   * @memberof module:lib/routes.Route
   * @instance
   * @param {Object} err
   * @return {Object}
   */
  printLogAttachFail (err) {
    const log = this.createLogger()
    log.error(`Route <${log.colors.silly(this.settings.uri)}> failed: ${JSON.stringify(err)} - ${log.fail}`)
    return Promise.reject(err)
  }

  /**
   * @memberof module:lib/routes.Route
   * @method printLogAttachSuccess
   * @instance
   * @param {Object} result
   * @return {Object}
   */
  printLogAttachSuccess (result) {
    const log = this.createLogger()
    const isRegister = (this.type === RouteTypes.RPC)
    const isSubscribe = (this.type === RouteTypes.PUBSUB)
    if (isRegister) {
      log.info(`Route RPC <${log.colors.silly(this.settings.uri)}> registered - ${log.ok}`)
    } else if (isSubscribe) {
      log.info(`Route PUBSUB <${log.colors.silly(this.settings.uri)}> subscribed - ${log.ok}`)
    } else {
      log.info(`Route HTTP <${log.colors.silly(this.settings.uri)}> attached - ${log.ok}`)
    }

    return result
  }

  registerWorker () {
    // const endpoint = this.createWrappedEndpoint.bind(this)
    // const onMessage = async (message = {}) => {
    //   const { type, id, args } = message
    //   if (type === `route:${this.settings.uri}`) {
    //     try {
    //       const result = await endpoint.call(this, ...args)
    //       process.send({
    //         id,
    //         result
    //       })
    //     } catch (error) {
    //       process.send({
    //         id,
    //         error
    //       })
    //     }
    //   }
    // }
    // // esperar uma resposta do worker
    // worker.on('message', onMessage)
    // this.printLogAttachSuccess()
  }

  /**
   * createWrappedEndpoint - Catch errors and normalize before return for crossbar engine
   *
   * @param {array} args Description
   *
   * @returns {type} Description
   */
  getMasterWrappedEndpoint (...args) {
    return new Promise(async (resolve, reject) => {
      try {
        let w
        let attempts = 0
        do {
          attempts++
          // pegar o primeiro worker e jogar pro final da fila
          w = application.workers.shift()
          application.workers.push(w)

          // se todos os workers estiverem ocupados esperar um pouco pra ver se alguem se libera
          if (attempts < WORKERS_AWAIT_MAX_ATTEMPTS && application.workers.filter(x => x.isBusy).length === WORKERS_MAX) {
            await snooze(WORKERS_AWAIT_TIMEOUT)
          } else if (attempts > WORKERS_AWAIT_MAX_ATTEMPTS) {
            break
          }
        } while (w.isBusy)
        attempts = 0

        // w = application.workers.shift()
        // application.workers.push(w)

        // gerar um ID para esse processamento
        const id = uuid()

        // enviar para o worker (subprocesso)
        if (w.isConnected()) {
          w.isBusy = true
          w.send({
            type: `route:${this.settings.uri}`,
            id,
            args
          })
        } else {
          w.on('online', () => {
            w.isBusy = true
            w.send({
              type: `route:${this.settings.uri}`,
              id,
              args
            })
          })
        }

        // esperar resposta do worker
        const onMessage = (responseWorker, response) => {
          responseWorker.isBusy = false
          const { result, error } = response
          if (response.id === id) {
            // remover listener deposi que receber a resposta do worker
            cluster.off('message', onMessage)
            // verifica se o endpoint do worker deu erro
            if (typeof error !== 'undefined') {
              return reject(error)
            }
            // devolve para o cliente que chamou a rota RPC ou PUBSUB o resultado do endpoint
            resolve(result)
          }
        }
        // esperar a resposta do worker para processar a resposta
        cluster.on('message', onMessage)
        cluster.on('exit', (worker, code, signal) => {
          worker.isBusy = false
          if (worker.id === w.id) {
            console.log(`[${this.settings.uri}] Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`)
            reject(`[${this.settings.uri}] Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`)
          }
        })
      } catch (err) {
        normalizeError(err)
        reject(err)
      }
    })
  }


  /**
   * Create a client side UI component interface
   * @param {String} querySelector Browser document.querySelector() arg
   * @param {Boolean} http Is a http request? 
   * @returns 
   */
  getComponentBySelector (querySelector, http = false) {
    const component = new Component(querySelector, this)
    component.$http = !!http
    return component
  }

}

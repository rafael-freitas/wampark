
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
*
* ******************************************************************************************************
*/
import { Worker, isMainThread, parentPort, workerData, threadId } from 'worker_threads'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import application from './Application.js'
import logger from './logger/index.js'
import normalizeError from './errors/normalizeError.js'
import ApplicationError from './ApplicationError.js'
import RouteTypes from './RouteTypes.js'
import Component from './Component.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default class Route {

  static RouteTypes = RouteTypes

  /**
   * URI da rota
   */
  static uri = undefined
  /**
   * Tipo da rota - RPC, PUBSUB, POST, GET...
   */
  static type = RouteTypes.RPC
  /**
   * Opções de registro da rota
   */
  static options = {}

  static {
    // inicializacao padrao
    this._initialize()
  }

  static _initialize() {
    this.log = logger(this.name)
  }

  /**
   * {session, args, kwargs, details, protocol, context}
   */
  request = {
    protocol: {
      origin: {}
    },
    context: {},
  }

  constructor () {

  }

  async endpoint ({args = [], kwargs = {}, details = {}}) {

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

  /**
   * Retorna o ID da session para chamadas do Agent em componentes
   * Ex: agent.SESSION_ID
   * @returns {Number}
   */
  _getTargetSessionId () {
    return this.request.protocol?.origin?.caller
  }


  // -------------------------------
  // PRIVATE STATIC
  // -------------------------------


  static _createInstance (requestContext) {
    const route = new this()
    route.session = requestContext.session
    Object.assign(route.request, requestContext)
    return route
  }

  static _attachToSession (session) {
    // reconfigurar classe
    this._initialize()
    this._registerEndpoint(session)
  }

  static _registerEndpoint (session) {

    // config da aplicacao
    const {settings} = application

    // ApplicationError.assert.object(this.settings, '_registerEndpoint.A001: settings must be an object')

    const {uri, type, options} = this
    
    ApplicationError.assert.string(uri, '_registerEndpoint.A001: uri must be a string')
    ApplicationError.assert.string(type, '_registerEndpoint.A001: settings.type must be a string')

    const wrappedEndpoint = this._callEndpoint.bind(this, session)

    if (type === RouteTypes.RPC) {
      if (settings.use_worker_threads) {
        if (isMainThread) {
          // throw new Error('Workers features not implemented yet')
          session.register(uri, this._callWorkersEndpoint.bind(this, session), options)
            .then(this._onAttachSuccess.bind(this))
            .then(this._printLogAttachSuccess.bind(this))
            .catch(this._onAttachFail.bind(this))
            .catch(this._printLogAttachFail.bind(this))
        }
        else {
          this._registerWorker(session)
        }
      }
      else {
        session.register(uri, wrappedEndpoint, options)
          .then(this._onAttachSuccess.bind(this))
          .then(this._printLogAttachSuccess.bind(this))
          .catch(this._onAttachFail.bind(this))
          .catch(this._printLogAttachFail.bind(this))
      }
      
    }
    else {
      if (type === RouteTypes.PUBSUB) {
        session.subscribe(uri, wrappedEndpoint, options)
          .then(this._onAttachSuccess.bind(this))
          .then(this._printLogAttachSuccess.bind(this))
          .catch(this._onAttachFail.bind(this))
          .catch(this._printLogAttachFail.bind(this))
      }
    }
  }

  static _callWorkersEndpoint (session, args, kwargs, details) {
    const log = logger(`[worker ${threadId}] ${this.uri}`)
    return new Promise(async (resolve, reject) => {
      const type = this.uri

      // log.info(`Send message to worker`)
      await application.sendMessageToWorker({
        payload: {
          type,
          args: [
            args,
            kwargs,
            details
          ],
        },
        resolve,
        reject
      })
    })
  }
  static _registerWorker (session) {
    
    const log = logger(`${this.uri} <worker ${threadId}>`)
    // log.info(`Register listener on main thread`)

    parentPort.on('message', async (message = {}) => {
      const { id, payload = {} } = message
      const {type, args} = payload

      // log.info(`Handling message check type=${type} messgae=${id}`)

      // mensagem para esta rota
      if (type === this.uri) {
        const [_args, kwargs, details] = args
        const requestContext = {session, args: _args, kwargs, details}
        try {
          const route = this._createInstance(requestContext)
          const result = await route.endpoint(requestContext)
          // log.info(`Sending response for message ${id}`)
          parentPort.postMessage({
            id,
            result
          })
        } catch (err) {
          const error = ApplicationError.parse(err)
          error.id = id
          throw error
          // if (['ReferenceError'].includes(err.name)) {
          //   // enviar o id da mensagem para o main thread
          //   error.id = id
          //   throw error
          // }
          // else {
          //   parentPort.postMessage({
          //     id,
          //     error: ApplicationError.parse(err).toObject()
          //   })
          // }
        }
      }
    })

  }

  static _callEndpoint (session, args, kwargs, details) {
    const requestContext = {session, args, kwargs, details}
    return new Promise(async (resolve, reject) => {
      try {
        const route = this._createInstance(requestContext)
        const result = await route.endpoint(requestContext)
        resolve(result)
      } catch (err) {
        normalizeError(err)
        reject(err)
      }
    })
  }

  // Impedir sobrescrita do método estático público
  static {
    Object.defineProperty(this, '_attachToSession', {
      writable: false,
      configurable: false,
    })
    Object.defineProperty(this, '_registerEndpoint', {
      writable: false,
      configurable: false,
    })
    Object.defineProperty(this, '_registerWorker', {
      writable: false,
      configurable: false,
    })
    Object.defineProperty(this, '_getWrappedEndpoint', {
      writable: false,
      configurable: false,
    })
  }

  /**
   * @param {Object} result
   * @return {Object}
   */
  static async _onAttachSuccess (result) {
    return result
  }

  /**
   * @param {Object} err
   */
  static _onAttachFail (err) {
    return Promise.reject(err)
  }

  /**
   * @param {Object} err
   * @return {Object}
   */
  static _printLogAttachFail (err) {
    const {log} = this
    log.error(`Route <${log.colors.silly(this.uri)}> failed: ${JSON.stringify(err)} - ${log.fail}`)
    return Promise.reject(err)
  }

  /**
   * @param {Object} result
   * @return {Object}
   */
  static _printLogAttachSuccess (result) {
    const {log} = this
    const isRegister = (this.type === RouteTypes.RPC)
    const isSubscribe = (this.type === RouteTypes.PUBSUB)
    if (isRegister) {
      log.info(`[worker ${threadId}] Route RPC <${log.colors.silly(this.uri)}> registered - ${log.ok}`)
    } else if (isSubscribe) {
      log.info(`[worker ${threadId}] Route PUBSUB <${log.colors.silly(this.uri)}> subscribed - ${log.ok}`)
    } else {
      log.info(`[worker ${threadId}] Route HTTP <${log.colors.silly(this.uri)}> attached - ${log.ok}`)
    }

    return result
  }

}

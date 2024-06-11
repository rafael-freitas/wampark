
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

// const WORKERS_MAX = process.env.WORKERS_MAX || os.cpus().length
const WORKERS_AWAIT_MAX_ATTEMPTS = 2
const WORKERS_AWAIT_TIMEOUT = 10


const snooze = ms => new Promise(resolve => setTimeout(resolve, ms))

export default class Route {

  static RouteTypes = RouteTypes

  /**
   * Configurações da rota
   */
  static settings = {
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

  constructor () {

    // Object.assign(this.settings, settings)

    // if (!this.settings.uri) {
    //   throw new ReferenceError('Setting "uri" is required', __filename)
    // }
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


  // -------------------------------
  // PRIVATE STATIC
  // -------------------------------


  static _createInstance (requestContext) {
    const route = new this()
    route.session = requestContext.session
    route._request = requestContext
    return route
  }

  static _attachToSession (session) {
    
    const {settings} = application

    if (settings.use_worker_threads) {
      this._registerWorker(session)
    }
    else {
      this._registerEndpoint(session)
    }
  }

  static _registerEndpoint (session) {

    ApplicationError.assert.object(this.settings, '_registerEndpoint.A001: settings must be an object')

    const {uri, type, options} = this.settings
    
    ApplicationError.assert.string(uri, '_registerEndpoint.A001: settings.uri must be a string')
    ApplicationError.assert.string(type, '_registerEndpoint.A001: settings.type must be a string')

    const wrappedEndpoint = this._callEndpoint.bind(this, session)

    if (type === RouteTypes.RPC) {
      session.register(uri, wrappedEndpoint, options)
        .then(this._onAttachSuccess.bind(this))
        .then(this._printLogAttachSuccess.bind(this))
        .catch(this._onAttachFail.bind(this))
        .catch(this._printLogAttachFail.bind(this))
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

  static _registerWorker () {
    throw new Error('Workers features not implemented yet')
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


  

  // /**
  //  * Register or subscribe this route into a session
  //  * @param session Autobahn session
  //  */
  // setSession (session) {
    
  //   ApplicationError.assert(session, 'setSession.E001: Session not found')

  //   this.session = session
  // }

  /**
   * @memberof module:lib/routes.Route
   * @method onAttachSuccess
   * @instance
   * @param {Object} result
   * @return {Object}
   */
  static async _onAttachSuccess (result) {
    return result
  }

  /**
   * @memberof module:lib/routes.Route
   * @method onAttachFail
   * @instance
   * @param {Object} err
   */
  static _onAttachFail (err) {
    return Promise.reject(err)
  }

  /**
   * @memberof module:lib/routes.Route
   * @instance
   * @param {Object} err
   * @return {Object}
   */
  static _printLogAttachFail (err) {
    const log = logger(this.settings.id || this.settings.uri)
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
  static _printLogAttachSuccess (result) {
    const log = logger(this.settings.id || this.settings.uri)
    const isRegister = (this.settings.type === RouteTypes.RPC)
    const isSubscribe = (this.settings.type === RouteTypes.PUBSUB)
    if (isRegister) {
      log.info(`Route RPC <${log.colors.silly(this.settings.uri)}> registered - ${log.ok}`)
    } else if (isSubscribe) {
      log.info(`Route PUBSUB <${log.colors.silly(this.settings.uri)}> subscribed - ${log.ok}`)
    } else {
      log.info(`Route HTTP <${log.colors.silly(this.settings.uri)}> attached - ${log.ok}`)
    }

    return result
  }

}

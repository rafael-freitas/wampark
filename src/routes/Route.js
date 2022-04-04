
/**
* ******************************************************************************************************
*
*   Route
*
*     Classe de rota para protocolo WAMP sobre Autobahn lib
*     Todas as rotas devem herdar de Route
*
*
*   @author     Rafael Freitas
*   @date       Feb 03 2018
*   @update     Apr 22 2018 by Rafael
*
*   @class Route
*   @memberof module:lib/routes
*   @requires {@link module:lib/routes.RouteTypes}
*
* ******************************************************************************************************
*/

// import { isEmpty, defaults } from 'lodash'
import defaults from 'lodash/defaults.js'
import isEmpty from 'lodash/isEmpty.js'
import normalizeError from '../errors/normalize.js'
import RouteTypes from './RouteTypes.js'
import logger from '../logger/index.js'
import ClientApplication from '../agent/ClientApplication.js'
import cluster from 'cluster'
import os from 'os'
import { v1 as uuid } from 'uuid'
import application from '../Application.js'

const TOTAL_CPU_CORES = process.env.CLUSTER_MAX_FORKS || os.cpus().length
const worker = cluster.worker
const WORKERS_AWAIT_MAX_ATTEMPTS = 2
const WORKERS_AWAIT_TIMEOUT = 10
const WORKERS_TOTAL = TOTAL_CPU_CORES


const _defaults = {
  type: RouteTypes.RPC,
  options: {}
}

const snooze = ms => new Promise(resolve => setTimeout(resolve, ms))

export class RouteProtocol {
  constructor (protocol) {
    Object.assign(this, {
      fromSession: null,
      targetSession: null,
      fromUser: null,
      targetUser: null
    }, protocol)
  }
}

export class RouteController {
  constructor ({ args, kwargs, details, session }) {
    this.args = args
    this.kwargs = kwargs
    this.details = details
    this.session = session

    this.routeProtocol = new RouteProtocol({
      fromUser: this.details.caller_authid,
      fromSession: this.details.caller,
      targetUser: this.details.caller_authid,
      targetSession: this.details.caller,
      args: this.args[0]
    })
  }

  get clientApplication () {
    return ClientApplication.create(this.routeProtocol)
  }

  /**
   * Chamada RPC para uma rota WAMP
   * @param  {String} name rota: `route.store.appAcoes.list
   * @param  {Mixed} payload
   * @return {Promise}
   */
  call (name, payload, options = {}) {
    return this.session.call(name, [this.routeProtocol], payload, options)
  }

  /**
   * Retorna os dados do usuario autenticado
   * @param {Boolean} returnAllUserData Se TRUE retorna os dados do usuario com seus grupos de permissoes e dados da empresa de contexto. DEFAULT TRUE
   */
  getCallerAuthId () {
    if (!this.details || !this.details.caller_authid) {
      return null
    }
    return this.details.caller_authid
  }
}

export default class Route {
  constructor (properties = {}) {
    properties = defaults(properties, _defaults)

    // detalhes do caller (quem chamou a rota)
    this.details = {}

    Object.assign(this, properties)

    const { uri } = this

    if (isEmpty(uri)) {
      throw new ReferenceError('property "uri" is required', __filename)
    }

    this.log = this.getLogger()
  }

  /**
   * Configura a instância antes de cada chamada
   */
  setup () {
    // ...
  }

  /**
   * Criar uma instancia a partir de outra Route já inicializada
   * Irá herdar os dados de sessão da rota de origem
   * @param  {Route} fromRoute Instancia de Route
   * @return {Route}
   */
  static extend (fromRoute) {
    const route = new this()
    route.routeController = fromRoute.routeController
    route.session = fromRoute.session
    return route
  }

  /**
   * Configura a rota em uma session wamp via Autobahn
   *
   * @memberof module:lib/routes.Route
   * @static
   * @param {Object} session
   * @return {Object}
   */
  static attach (session, options = {}) {
    const route = new this(options)
    route.setSession(session)
    return route
  }

  get clientApplication () {
    return this.routeController.clientApplication
  }

  /**
   * @memberof module:lib/routes.Route
   * @method logger
   * @instance
   */
  getLogger () {
    return logger(this.logName || this.uri || this.constructor.name)
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
    const log = this.getLogger()
    log.error(`Route <${log.colors.silly(this.uri)}> failed: ${JSON.stringify(err)} - ${log.fail}`)
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
    const log = this.getLogger()
    const isRegister = (this.type === RouteTypes.RPC)
    const isSubscribe = (this.type === RouteTypes.PUBSUB)
    if (isRegister) {
      log.info(`Route RPC <${log.colors.silly(this.uri)}> registered - ${log.ok}`)
    } else if (isSubscribe) {
      log.info(`Route PUBSUB <${log.colors.silly(this.uri)}> subscribed - ${log.ok}`)
    } else {
      log.info(`Route HTTP <${log.colors.silly(this.uri)}> attached - ${log.ok}`)
    }

    return result
  }

  /**
   * Register or subscribe this route into a session
   * @param session Autobahn session
   */
  setSession (session) {
    this.session = session
    // ativar cluster?
    if (application.config.cluster) {
      if (cluster.isMaster) {
        if (this.type === RouteTypes.RPC) {
          session.register(this.uri, this.getMasterWrappedEndpoint.bind(this), this.options)
            .then(this.onAttachSuccess.bind(this))
            .then(this.printLogAttachSuccess.bind(this))
            .catch(this.onAttachFail.bind(this))
            .catch(this.printLogAttachFail.bind(this))
        } else {
          if (this.type === RouteTypes.PUBSUB) {
            session.subscribe(this.uri, this.getMasterWrappedEndpoint.bind(this), this.options)
              .then(this.onAttachSuccess.bind(this))
              .then(this.printLogAttachSuccess.bind(this))
              .catch(this.onAttachFail.bind(this))
              .catch(this.printLogAttachFail.bind(this))
          }
        }
      } else {
        // is a new process - a worker, so create a new channel for communication between the worker
        // and the main process to send the worker response through process.send() method
        this.registerWorker()
      }
    } else {
      if (this.type === RouteTypes.RPC) {
        session.register(this.uri, this.getWrappedEndpoint.bind(this), this.options)
          .then(this.onAttachSuccess.bind(this))
          .then(this.printLogAttachSuccess.bind(this))
          .catch(this.onAttachFail.bind(this))
          .catch(this.printLogAttachFail.bind(this))
      } else {
        if (this.type === RouteTypes.PUBSUB) {
          session.subscribe(this.uri, this.getWrappedEndpoint.bind(this), this.options)
            .then(this.onAttachSuccess.bind(this))
            .then(this.printLogAttachSuccess.bind(this))
            .catch(this.onAttachFail.bind(this))
            .catch(this.printLogAttachFail.bind(this))
        }
      }
    }
  }

  registerWorker () {
    const endpoint = this.getWrappedEndpoint.bind(this)
    const onMessage = async (message = {}) => {
      const { type, id, args } = message
      if (type === `route:${this.uri}`) {
        try {
          const result = await endpoint.call(this, ...args)
          process.send({
            id,
            result
          })
        } catch (error) {
          process.send({
            id,
            error
          })
        }
      }
    }
    // esperar uma resposta do worker
    worker.on('message', onMessage)
    this.printLogAttachSuccess()
  }

  /**
   * getWrappedEndpoint - Catch errors and normalize before return for crossbar engine
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
          if (attempts < WORKERS_AWAIT_MAX_ATTEMPTS && application.workers.filter(x => x.isBusy).length === WORKERS_TOTAL) {
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
            type: `route:${this.uri}`,
            id,
            args
          })
        } else {
          w.on('online', () => {
            w.isBusy = true
            w.send({
              type: `route:${this.uri}`,
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
            console.log(`[${this.uri}] Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`)
            reject(`[${this.uri}] Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`)
          }
        })
      } catch (err) {
        normalizeError(err)
        reject(err)
      }
    })
  }

  /**
   * getWrappedEndpoint - Captura erros e normaliza antes de retornar para engine do crossbar
   *
   * @param {array} args Description
   *
   * @returns {type} Description
   */
  getWrappedEndpoint (...args) {
    return new Promise((resolve, reject) => {
      try {
        // console.log(`getWrappedEndpoint`, `args[0]`, args[0], `args[1]`, args[1], `args[2]`, args[2])
        // instanciar o Controller que mantem so parametros da chamada
        this.routeController = new RouteController({
          args: args[0],
          kwargs: args[1],
          details: args[2],
          session: this.session
        })

        // metodo opcional para configurar a instancia da rota antes de executar o endpoint
        this.setup()

        const result = this.endpoint(...args)
        if (typeof result !== 'undefined' && ((result instanceof Promise || result !== null) && typeof result.then === 'function')) {
          result.then(resolve).catch((err) => {
            // add toJSON()
            normalizeError(err)
            if (this.log) {
              this.printLogAttachFail(err)
            }
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
   * Make an RPC call sending protocol data for the caller
   * @param  {String} name rota: `route.myRPCRoute
   * @param  {Mixed} payload the same that "wargs" on procedure
   * @return {Promise}
   */
  call (name, payload) {
    return this.routeController.call(name, payload)
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
  endpoint (args = [], kwargs = {}, details = {}) {

  }
}

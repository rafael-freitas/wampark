/**
 * @description
 * ## Adaptador de conexão Autobahn
 * Conecta automaticamente à um servidor WAMP Crossbar.io via Autobahn.
 * As configurações de conexão são obtidas do {@link config}
 *
 * ```js
 * autobahn : {
 *   // setando true o adapter inicia a conexao automaticamente
 *   autoconnect : process.env.AUTOBAHN_AUTO_CONNECT || true,
 *   url         : "ws://172.22.1.1:9000",
 *   realm       : "realm1",
 *   authid      : "backend-service-user",
 *   authpass    : "authP4555ec3tB4ck",
 *   authmethods : ["wampcra"],
 * },
 * ```
 * @author     Rafael Freitas
 * @date       Jan 31 2018
 * @updated    2024-06-10 00:56:15
 * @module lib/wamp-adapter
 * @example
 * import wampServer from '/lib/wamp-server'
 */
import { Worker, isMainThread, parentPort, workerData, threadId } from 'worker_threads'
import { EventEmitter } from 'events'
import autobahn from 'autobahn'
import assert from 'assert'
import logger from './logger/index.js'
import WampAdapterError from './WampAdapterError.js'
import ApplicationError from './ApplicationError.js'

export default class WampAdapter extends EventEmitter {

  connection = null

  get session () {
    return this.connection.currentSession
  }

  get isOpen () {
    return this.connection.isOpen
  }

  /**
   * Cria uma instancia de conexao com o Crossbar.io via Autobahn
   * @typedef ConnectionSettings
   * @property {boolean} autoconnect - setando true o adapter inicia a conexao automaticamente
   * @property {string} url - endereço WebSocket para o servidor ex: `"ws://172.22.1.1:9000"`
   * @property {string} realm - reino da conexão
   * @property {string} authid - ID de login para o WAMP
   * @property {string} authpass - senha para o login informado
   * @property {Array} authmethods - método de autenticação no servidor. default: `['wampcra']`
   * @property {Function} onopen - função chamada a cada vez que a conexão é estabelecida
   * @property {Function} onclose - função chamada a cada vez que a conexão é fechada
   * 
   * @param {ConnectionSettings} settings 
   */
  constructor (settings) {
    super()

    /*
    validações / asserts
    ------------------------------------------------------------------------
    */
    assert(typeof settings === 'object', 'Informe os parametros de conexão')
    assert(typeof settings.url !== 'undefined', 'Informe a URL do servidor WAMP em ``WAMP_URL')
    assert(typeof settings.realm !== 'undefined', 'Informe a `realm` do servidor WAMP em `WAMP_REALM`')
    assert(typeof settings.authid !== 'undefined', 'Informe o `authid` do servidor WAMP em `WAMP_AUTHID`')
    assert(typeof settings.authpass !== 'undefined', 'Informe o `authpass` do servidor WAMP em `WAMP_AUTHPASS`')

    // metodo de autenticacao padrao
    if (!settings.authmethods) {
      settings.authmethods = ["wampcra"]
    }

    this.settings = settings
    this.autobahn = autobahn
    this.log = logger('WampAdaper')

    const {log} = this

    // especificar wamp.2.json protocol para manter compatibilidade com autobahn 20.x
    Object.assign(settings, { onchallenge, protocols: ['wamp.2.json'] }, settings)

    const connection = new autobahn.Connection(settings)

    // salvar conexão na instancia do WampAdapter
    this.connection = connection

    log.info(`[worker ${threadId}] Connection created for ${log.colors.yellow(settings.url)} -> realm: "${log.colors.yellow(settings.realm)}"`)

    connection.onopen = this.onOpenConnection.bind(this)
    connection.onclose = this.onCloseConnection.bind(this)

    /**
     * Ao conectar ao router este callback ira autenticar este modulo
     *
     * @method onchallenge
     * @private
     * @param  {Session}   session Dados da sessão
     * @param  {String}    method  Padrao: `wampcra`
     * @param  {Object}    extra   Parametros enviados pelo autenticador
     */
    function onchallenge (session, method, extra) {
      if (method === 'wampcra') {
        return autobahn.auth_cra.sign(settings.authpass, extra.challenge)
      } else {
        throw new WampAdapterError(`A001: The adapter don't know how to authenticate using "${method}"`)
      }
    }

    // Object.freeze(this)

    // // Abre a conexão com o crossbar.io
    if (settings.autoconnect === true) {
      this.open()
    }
  }

  open () {
    this.connection.open()
  }

  onOpenConnection (session) {
    const {log} = this
    log.info(`[worker ${threadId}] Connected in ${log.colors.yellow(this.settings.url)} -> realm: "${log.colors.yellow(this.settings.realm)}" on session id (${log.colors.green(session.id)}) - ${log.ok}`)

    this.applySessionWrappers(session)
  
    // guarda a session atual para acesso externo
    this.connection.currentSession = session
    // this.connection.isOpen = true
  
    // emitir evento de conexao aberta
    this.emit('wamp.session.open', session)

    if (typeof this.settings.onopen === 'function') {
      this.settings.onopen(session)
    }
  }
  
  onCloseConnection (reason, details) {
    const {log} = this
    switch (reason) {
      case 'unreachable':
        log.error(`[worker ${threadId}] Fail to connect to crossbar.io: "unreachable" - ${log.fail}`, details)
        break
      default:
        log.warn(`[worker ${threadId}] The connection to crossbar.io was closed: ${reason}'`, details)
    }

    // this.connection.isOpen = false

    this.emit('wamp.session.close', reason, details)

    if (typeof this.settings.onclose === 'function') {
      this.settings.onclose(reason, details)
    }
  }

  /**
   * @description
   * applySessionWrappers - Cria closures para os metodos de registro de rotas
   * @memberof module:lib/wamp-adapter
   * @param {Object} session Description
   * @returns {Object} Description
   */
  applySessionWrappers (session) {
    const {log} = this
    // permitir atachar objetos Route() na sessao
    // routeInjectorMiddleware(session)

    const self = this

    // session.register - criar um wrapper para chamadas RPC session.register()
    session.register = this.sessionMethodWrapper(session.register, function (resolve, reject, exception) {
      log.debug('Runtime Error', exception)
      reject(self.parseErrorToObject(exception))
    })

    return session
  }

  routeInjectorMiddleware (session) {
    return function inject (route) {
      route.attach(session)
    }
  }

  /**
   * @description
   * parseErrorToObject - converte um erro para objeto
   * @memberof module:lib/wamp-adapter
   * @param {Object} err Description
   * @private
   * @returns {Object} Description
   */
  parseErrorToObject (err) {
    if (err instanceof ApplicationError) {
      return err.toJSON()
    }
    return ApplicationError.toObject(err)
  }

  /**
   * sessionMethodWrapper - captura erros ocorridos na rota e rejeita para o Crossbar.io
   * @memberof module:lib/wamp-adapter
   * @param {Function} sessionMethod
   * @param {Function} onError
   *
   * @returns {Function}
   */
  sessionMethodWrapper (sessionMethod, onError) {
    return function newSessionMethod () {
      // callback fn => session.register('my.procedure', function(){}, ...)
      let [uri, endpoint, ...options] = arguments

      // segundo argumento
      endpoint = createEndpointCatcherErrorWrapper(endpoint)

      // call method -> register, subscribe
      return sessionMethod.apply(this, [uri, endpoint, ...options])
    }

    /**
     * Encapsula o callback do methodo para captura de erros
     * @return {Function} - Retorna uma funcao encapsulada
     */
    function createEndpointCatcherErrorWrapper (endpoint) {
      /**
       * Encapsula o endpoint do methodo para captura de erros
       * @return {Promise}
       */
      return function newEndpoint () {
        const [args, kwargs, details] = arguments
        try {
          const result = endpoint(args, kwargs, details)
          return result
        // resolve(result)
        } catch (exception) {
          if (typeof onError === 'function') {
            return onError(exception)
          } else {
            throw exception
          }
        }
      }
    }
  }

}

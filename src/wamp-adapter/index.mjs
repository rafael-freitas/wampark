import autobahn from 'autobahn'
import assert from 'assert'

import logger, { logname } from '../logger'

import WampAdapterError from './WampAdapterError'
import { sessionWrapper } from './wrappers'
import Application from '../Application'

const AUTOBAHN_DEFAULT_CONFIG = {
  hostname: 'localhost',
  port: 9000,
  get url () {
    return `ws://${this.hostname}:${this.port}/ws`
  },
  realm: 'realm1',
  authid: 'userid',
  authpass: 'userpass',
  authmethods: ['wampcra']
}

/**
 * @description
 * ## Adaptador de conexão Autobahn
 * Conecta automaticamente à um servidor WAMP Crossbar.io via Autobahn.
 * As configurações de conexão são obtidas do {@link config}
 *
 * ```js
 * // configurações no `config/env/development.js`
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
 * @module lib/wamp-adapter
 * @example
 * import wampServer from '/lib/wamp-server'
 */

/**
 * @typedef {Object} ConnectionOptions
 * @static
 * @property {boolean} autoconnect - setando true o adapter inicia a conexao automaticamente
 * @property {string} url - endereço WebSocket para o servidor ex: `"ws://172.22.1.1:9000"`
 * @property {string} realm - reino da conexão
 * @property {string} authid - ID de login para o WAMP
 * @property {string} authpass - senha para o login informado
 * @property {Array} authmethods - método de autenticação no servidor. default: `['wampcra']`
 */

const log = logger('wamp-adapter')

export const CONNECTION_DELAY = 10

export let currentSession

// if (autoconnect && true) {
//   log.info(`Conectar automaticamente em ${log.colors.yellow(config.wamp.url)} no realm: ${log.colors.yellow(config.wamp.realm)}`)
//   // agendar para depois para que os outros modulos instalem o listener
//   setTimeout(connect, CONNECTION_DELAY)
// }

// exporta WampAdapter
export { connect, createConnection }

/**
 * connect - Cria uma conexao com o Crossbar.io via Autobahn e abre a conexao
 * automaticamente
 *
 * o mesmo que:
 * ```js
 * const { connect } = require('app/lib/wamp-adapter')
 * const settings = {
 *  url, realm, authid, authpass, authmethods
 * }
 * let connection = connect(settings) // vc pode passar os dados da conexao por parametro
 * connection.close()
 * ```
 *
 * @returns {Connection} autobahn.Connection
 */
function connect (settings) {
  const connection = createConnection(settings).open()
  return connection
}

/**
 * connect - cria uma instancia de conexao com o Crossbar.io via Autobahn
 *
 * @param {object} [settings=Config] Usa o config.autobahn como padrao
 * @param {Application} application Instancia da aplicaçao
 *
 * @returns {Connection} autobahn.Connection
 */
function createConnection (settings) {
  /*
      validaçoes / asserts
      ------------------------------------------------------------------------
  */
  assert(typeof settings !== 'undefined', 'Set `wamp` config on your envoirment')
  assert(typeof settings.url !== 'undefined', 'Informe a URL do servidor WAMP em ``WAMP_URL')
  assert(typeof settings.realm !== 'undefined', 'Informe a `realm` do servidor WAMP em `WAMP_REALM`')
  assert(typeof settings.authid !== 'undefined', 'Informe o `authid` do servidor WAMP em `WAMP_AUTHID`')
  assert(typeof settings.authpass !== 'undefined', 'Informe o `authpass` do servidor WAMP em `WAMP_AUTHPASS`')


  settings = Object.assign({ onchallenge }, settings)
  const connection = new autobahn.Connection(settings)

  log.info(`Connection created for ${log.colors.yellow(settings.url)} -> realm: "${log.colors.yellow(settings.realm)}"`)

  connection.onopen = onOpenConnection
  connection.onclose = onCloseConnection

  /**
   * Ao conectar ao router este callback ira autenticar este modulo
   *
   * @method onchallenge
   * @private
   * @param  {Session}    session Dados da sessão
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

  function onOpenConnection (session) {
    log.info(`WAMP Connected on session id (${session.id}) - ${log.ok}`)
  
    // guarda a session atual para acesso externo
    currentSession = session
  
    // emitir evento de conexao aberta
    settings.onopen(sessionWrapper(session))
  }
  
  function onCloseConnection (reason, details) {
    switch (reason) {
      case 'unreachable':
        log.error(`Fail to connect to crossbar.io: "unreachable" - ${log.fail}`, details)
        break
      default:
        log.warn(`The connection to crossbar.io was closed: ${reason}'`, details)
    }
    settings.onclose(reason, details)
    // application.emit('wamp.session.close', reason, details)
  }

  return connection
}

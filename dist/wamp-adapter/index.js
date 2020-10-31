"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connect = connect;
exports.createConnection = createConnection;
exports.currentSession = exports.CONNECTION_DELAY = void 0;

var _autobahn = _interopRequireDefault(require("autobahn"));

var _assert = _interopRequireDefault(require("assert"));

var _logger = _interopRequireDefault(require("../logger"));

var _WampAdapterError = _interopRequireDefault(require("./WampAdapterError"));

var _wrappers = require("./wrappers");

var _Application = _interopRequireDefault(require("../Application"));

var AUTOBAHN_DEFAULT_CONFIG = {
  hostname: 'localhost',
  port: 9000,

  get url() {
    return "ws://".concat(this.hostname, ":").concat(this.port, "/ws");
  },

  realm: 'realm1',
  authid: 'userid',
  authpass: 'userpass',
  authmethods: ['wampcra']
};
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

var log = (0, _logger["default"])('wamp-adapter');
var CONNECTION_DELAY = 10;
exports.CONNECTION_DELAY = CONNECTION_DELAY;
var currentSession; // if (autoconnect && true) {
//   log.info(`Conectar automaticamente em ${log.colors.yellow(config.wamp.url)} no realm: ${log.colors.yellow(config.wamp.realm)}`)
//   // agendar para depois para que os outros modulos instalem o listener
//   setTimeout(connect, CONNECTION_DELAY)
// }
// exporta WampAdapter

exports.currentSession = currentSession;

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
function connect(settings) {
  var connection = createConnection(settings).open();
  return connection;
}
/**
 * connect - cria uma instancia de conexao com o Crossbar.io via Autobahn
 *
 * @param {object} [settings=Config] Usa o config.autobahn como padrao
 * @param {Application} application Instancia da aplicaçao
 *
 * @returns {Connection} autobahn.Connection
 */


function createConnection(settings) {
  /*
      validaçoes / asserts
      ------------------------------------------------------------------------
  */
  (0, _assert["default"])(typeof settings !== 'undefined', 'Set `wamp` config on your envoirment');
  (0, _assert["default"])(typeof settings.url !== 'undefined', 'Informe a URL do servidor WAMP em ``WAMP_URL');
  (0, _assert["default"])(typeof settings.realm !== 'undefined', 'Informe a `realm` do servidor WAMP em `WAMP_REALM`');
  (0, _assert["default"])(typeof settings.authid !== 'undefined', 'Informe o `authid` do servidor WAMP em `WAMP_AUTHID`');
  (0, _assert["default"])(typeof settings.authpass !== 'undefined', 'Informe o `authpass` do servidor WAMP em `WAMP_AUTHPASS`');
  settings = Object.assign({
    onchallenge: onchallenge
  }, settings);
  var connection = new _autobahn["default"].Connection(settings);
  log.info("Connection created for ".concat(log.colors.yellow(settings.url), " -> realm: \"").concat(log.colors.yellow(settings.realm), "\""));
  connection.onopen = onOpenConnection;
  connection.onclose = onCloseConnection;
  /**
   * Ao conectar ao router este callback ira autenticar este modulo
   *
   * @method onchallenge
   * @private
   * @param  {Session}    session Dados da sessão
   * @param  {String}    method  Padrao: `wampcra`
   * @param  {Object}    extra   Parametros enviados pelo autenticador
   */

  function onchallenge(session, method, extra) {
    if (method === 'wampcra') {
      return _autobahn["default"].auth_cra.sign(settings.authpass, extra.challenge);
    } else {
      throw new _WampAdapterError["default"]("A001: The adapter don't know how to authenticate using \"".concat(method, "\""));
    }
  }

  function onOpenConnection(session) {
    log.info("WAMP Connected on session id (".concat(session.id, ") - ").concat(log.ok)); // guarda a session atual para acesso externo

    exports.currentSession = currentSession = session; // emitir evento de conexao aberta

    settings.onopen((0, _wrappers.sessionWrapper)(session));
  }

  function onCloseConnection(reason, details) {
    switch (reason) {
      case 'unreachable':
        log.error("Fail to connect to crossbar.io: \"unreachable\" - ".concat(log.fail), details);
        break;

      default:
        log.warn("The connection to crossbar.io was closed: ".concat(reason, "'"), details);
    }

    settings.onclose(reason, details); // application.emit('wamp.session.close', reason, details)
  }

  return connection;
}
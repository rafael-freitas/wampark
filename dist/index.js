"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _Application = _interopRequireDefault(require("./Application"));

var _logger = _interopRequireDefault(require("./logger"));

var _cluster = _interopRequireDefault(require("cluster"));

var _os = _interopRequireDefault(require("os"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * @requires {@link module:lib/apllication.Application}
 * @requires {@link module:lib/logger}
 * @requires {@link module:lib/webserver}
 * @requires {@link module:lib/wamp-adapter}
 * @requires {@link module:lib/db}
 * @requires config
 * @description
 * Fornece a arquitetura para aplicação.
 * Gerencia os servidores de serviços e conexões com WAMP e Banco de Dados
 * @author     Rafael Freitas
 * @date       Feb 13 2018
 * @module lib/apllication
 * @example
 * import application from '/lib/application'
 */
// utilizar o parametro config.maxClusterForks do CONFIG quando for um numero valido maior que 0, se nao usar o maximo de CPUs
var TOTAL_CPU_CORES = process.env.CLUSTER_MAX_FORKS || _os["default"].cpus().length;

function createApplication() {
  var extraConfigs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  // CLONE ENVOIRIMENT VALUES FOR CONFIG
  var config = Object.assign({}, process.env, extraConfigs); // default delay is 10 seconds

  if (typeof config.WAMP_CONNECTION_DELAY === 'undefined') {
    config.WAMP_CONNECTION_DELAY = 10;
  } // create a logger default application instance for general logs


  var log = (0, _logger["default"])('application'); // singleton global Application

  var application = new _Application["default"](_objectSpread(_objectSpread({}, config), {}, {
    logger: _logger["default"]
  }));

  if (config.WAMP_AUTOCONNECT) {
    log.info("Trying to connect to WAMP SERVER in ".concat(log.colors.yellow(config.WAMP_URL), " on realm: ").concat(log.colors.yellow(config.WAMP_REALM))); //   // agendar para depois para que os outros modulos instalem o listener

    setTimeout(function () {
      application.connectWampServer();
    }, config.WAMP_CONNECTION_DELAY);
  } else {
    log.warn('WAMP connections is disabled. To enable set true "WAMP_AUTOCONNECT" on config or your envoirement');
  }

  return application;
} // debugger


var application = createApplication();

if (application.CLUSTER_ENABLED) {
  _cluster["default"].setMaxListeners(1000 * 10);

  if (_cluster["default"].isMaster) {
    console.log('Master process is running');

    _cluster["default"].setupMaster({
      args: ['--extensions', '.mjs']
    }); // Fork workers - save cluster workers on application


    for (var i = 0; i < TOTAL_CPU_CORES; i++) {
      application.workers.push(_cluster["default"].fork());
    }

    _cluster["default"].on('exit', function (worker, code, signal) {
      console.log("Worker ".concat(worker.process.pid, " died with code: ").concat(code, ", and signal: ").concat(signal));
      console.log('Starting a new worker');

      _cluster["default"].fork(); // remover o worker que morreu


      if (application.workers.indexOf(worker) !== -1) {
        application.workers.splice(application.workers.indexOf(worker), 1);
      }
    });
  } else {
    console.log("Worker ".concat(_cluster["default"].worker.id));

    _cluster["default"].worker.setMaxListeners(1000 * 10);
  }
}

var _default = application;
exports["default"] = _default;
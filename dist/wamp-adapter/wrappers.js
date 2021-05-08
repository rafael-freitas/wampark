"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sessionWrapper = sessionWrapper;
exports.sessionMethodWrapper = sessionMethodWrapper;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _logger = _interopRequireDefault(require("../logger"));

var _errors = require("../errors");

var log = (0, _logger["default"])('wamp-adapter');

/**
 * @description
 * sessionWrapper - Cria closures para os metodos de registro de rotas
 * @memberof module:lib/wamp-adapter
 * @param {Object} session Description
 * @returns {Object} Description
 */
function sessionWrapper(session) {
  // permitir atachar objetos Route() na sessao
  routeInjectorMiddleware(session); // criar um wrapper para chamadas RPC session.register()

  session.register = sessionMethodWrapper(session.register, function (resolve, reject, exception) {
    log.debug('Runtime Error', exception);
    reject(parseErrorToObject(exception));
  });
  return session;
}

function routeInjectorMiddleware(session) {
  return function inject(route) {
    route.attach(session);
  };
}
/**
 * @description
 * parseErrorToObject - converte um erro para objeto
 * @memberof module:lib/wamp-adapter
 * @param {Object} err Description
 * @private
 * @returns {Object} Description
 */


function parseErrorToObject(err) {
  if (err instanceof _errors.ApplicationError) {
    return err.toJSON();
  }

  return _errors.ApplicationError.toObject(err);
}
/**
 * sessionMethodWrapper - captura erros ocorridos na rota e rejeita para o Crossbar.io
 * @memberof module:lib/wamp-adapter
 * @param {Object} method
 * @param {Function} onError
 *
 * @returns {Function}
 */


function sessionMethodWrapper(method, onError) {
  return function newSessionMethod() {
    // callback fn => session.register('my.procedure', function(){}, ...)
    var _arguments = Array.prototype.slice.call(arguments),
        uri = _arguments[0],
        endpoint = _arguments[1],
        options = _arguments.slice(2); // segundo argumento


    endpoint = createEndpointCatcherErrorWrapper(endpoint); // call method -> register, subscribe

    return method.apply(this, [uri, endpoint].concat((0, _toConsumableArray2["default"])(options)));
  };
  /**
   * Encapsula o callback do methodo para captura de erros
   * @return {Function} - Retorna uma funcao encapsulada
   */

  function createEndpointCatcherErrorWrapper(endpoint) {
    /**
     * Encapsula o endpoint do methodo para captura de erros
     * @return {Promise}
     */
    return function newEndpoint() {
      var _arguments2 = Array.prototype.slice.call(arguments),
          args = _arguments2[0],
          kwargs = _arguments2[1],
          details = _arguments2[2];

      try {
        var result = endpoint(args, kwargs, details);
        return result; // resolve(result)
      } catch (exception) {
        if (typeof onError === 'function') {
          return onError(exception);
        } else {
          throw exception;
        }
      }
    };
  }
}
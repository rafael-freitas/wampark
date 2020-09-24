"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sessionWrapper = sessionWrapper;
exports.sessionMethodWrapper = sessionMethodWrapper;

var _logger = _interopRequireDefault(require("../logger"));

var _errors = require("../errors");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

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

    return method.apply(this, [uri, endpoint].concat(_toConsumableArray(options)));
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
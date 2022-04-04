import logger from '../logger/index.js'
import ApplicationError from '../errors/ApplicationError.js'

const log = logger('wamp-adapter')

export { sessionWrapper, sessionMethodWrapper }

/**
 * @description
 * sessionWrapper - Cria closures para os metodos de registro de rotas
 * @memberof module:lib/wamp-adapter
 * @param {Object} session Description
 * @returns {Object} Description
 */
function sessionWrapper (session) {
  // permitir atachar objetos Route() na sessao
  routeInjectorMiddleware(session)

  // criar um wrapper para chamadas RPC session.register()
  session.register = sessionMethodWrapper(session.register, function (resolve, reject, exception) {
    log.debug('Runtime Error', exception)
    reject(parseErrorToObject(exception))
  })

  return session
}

function routeInjectorMiddleware (session) {
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
function parseErrorToObject (err) {
  if (err instanceof ApplicationError) {
    return err.toJSON()
  }
  return ApplicationError.toObject(err)
}

/**
 * sessionMethodWrapper - captura erros ocorridos na rota e rejeita para o Crossbar.io
 * @memberof module:lib/wamp-adapter
 * @param {Object} method
 * @param {Function} onError
 *
 * @returns {Function}
 */
function sessionMethodWrapper (method, onError) {
  return function newSessionMethod () {
    // callback fn => session.register('my.procedure', function(){}, ...)
    let [uri, endpoint, ...options] = arguments

    // segundo argumento
    endpoint = createEndpointCatcherErrorWrapper(endpoint)

    // call method -> register, subscribe
    return method.apply(this, [uri, endpoint, ...options])
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

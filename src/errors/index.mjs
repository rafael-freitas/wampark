import ErrorTypes from './ErrorTypes'
import ApplicationError from './ApplicationError'
import normalize from './normalize'

/**
 * @requires {@link module:lib/errors.ErrorTypes}
 * @requires {@link module:lib/errors.ApplicationError}
 * @requires {@link module:lib/errors.normalize}
 * @description
 * ## Manipulador de Erros
 * Interface para manipulação de erros no servidor
 * @module lib/errors
 * @example
 * import errors from '/lib/errors'
 */

/**
* Cria um gerenciador de erros
* @memberof lib.errors
* @param  {String}  error_prefix  Nome do modulo
* @return {module:lib/errors/creator~Err} Retorna um objeto para encapsulamento de erros do tipo [Err]{@link module:lib/errors/creator~Err}
*
* @example
* var error = imports.errors("PREFIX")
* // criar uma instancia de erro
* error('E03: Ocorreu um erro', errNativeExceptionObject ) // cria o erro PREFIXE03
*/
function createErrorWapper (family, ErrorClass = 'ApplicationError') {
  return function (description, details) {
    const err = new ApplicationError(description, details)
    err.nameError = ErrorClass
    err.setFamily(family)
    return err
  }
}

/**
 * normalizeWrapper - adiciona o metodo toJSON em uma instancia de Error
 * @memberof lib.errors
 * @param {Error} err Se nao for uma instancia de Error sera ignorado
 * @returns {Promise} Retorna uma promise rejeitada
 */
function normalizeWrapper (err) {
  normalize(err)
  return Promise.reject(err)
}

/*
    exports
    ------------------------------------------------------------------------
 */

export {
  createErrorWapper as create,
  normalizeWrapper as normalize,
  ErrorTypes,
  ApplicationError
}

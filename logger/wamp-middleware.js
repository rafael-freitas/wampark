/**
 *   middleware
 *
 * Adiciona helpers para o logger
 * @author     Rafael Freitas
 * @date       Feb 13 2018
 * @memberof module:lib/logger
 */

export default {
  registrationSuccess,
  registrationFail,
  middleware: function (logger) {
    Object.assign(logger, {
      wamp: {
        success: registrationSuccess(logger),
        fail: registrationFail(logger)
      }
    })
    return logger
  }
}

function registrationSuccess (logger) {
  /**
   * uriWrapper description
   *
   *
   *
   * .then(result => log.info(`procedure <${log.colors.blue(result.procedure)}> registred - ${log.ok}`))
   * .catch(error => log.error('Falha ao registrar a procedure `web.authenticate.ticket`', error))
   *
   *
   *
   * @param {Object} route
   * @return {Object}
   */
  return function uriWrapper (route) {
    return function (result) {
      logger.info(`Procedure <${logger.colors.blue(result.procedure)}> registred - ${logger.ok}`)
      return result
    }
  }
}

function registrationFail (logger) {
  /**
   * uriWrapper description
   *
   *
   *
   * .then(result => log.info(`procedure <${log.colors.blue(result.procedure)}> registred - ${log.ok}`))
   * .catch(error => log.error('Falha ao registrar a procedure `web.authenticate.ticket`', error))
   *
   *
   *
   * @param  {Object} route
   * @return {Function}
   */
  return function uriWrapper (route) {
    return function (err) {
      logger.error(`Procedure <${logger.colors.blue(route.uri)}> failed: ${JSON.stringify(err)} - ${logger.fail}`)
      return Promise.reject(err)
    }
  }
}

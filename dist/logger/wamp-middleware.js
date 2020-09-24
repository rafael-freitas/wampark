"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

/**
 *   middleware
 *
 * Adiciona helpers para o logger
 * @author     Rafael Freitas
 * @date       Feb 13 2018
 * @memberof module:lib/logger
 */
var _default = {
  registrationSuccess: registrationSuccess,
  registrationFail: registrationFail,
  middleware: function middleware(logger) {
    Object.assign(logger, {
      wamp: {
        success: registrationSuccess(logger),
        fail: registrationFail(logger)
      }
    });
    return logger;
  }
};
exports["default"] = _default;

function registrationSuccess(logger) {
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
  return function uriWrapper(route) {
    return function (result) {
      logger.info("Procedure <".concat(logger.colors.blue(result.procedure), "> registred - ").concat(logger.ok));
      return result;
    };
  };
}

function registrationFail(logger) {
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
  return function uriWrapper(route) {
    return function (err) {
      logger.error("Procedure <".concat(logger.colors.blue(route.uri), "> failed: ").concat(JSON.stringify(err), " - ").concat(logger.fail));
      return Promise.reject(err);
    };
  };
}
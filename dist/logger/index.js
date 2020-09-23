
/**
 * @requires winston
 * @requires cluster
 * @requires path
 * @requires moment
 * @requires colors
 * @requires config
 * @description
 * ## Biblioteca de log
 *
 * For example, npm logging levels are prioritized from 0 to 5 (highest to lowest):
 * `{ error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }`
 *     Specification from @see {@link https://tools.ietf.org/html/rfc5424}
 *
 *      Code     Numerical     Severity
 *
 *       0       Emergency: system is unusable
 *       1       Alert: action must be taken immediately
 *       2       Critical: critical conditions
 *       3       Error: error conditions
 *       4       Warning: warning conditions
 *       5       Notice: normal but significant condition
 *       6       Informational: informational messages
 *       7       Debug: debug-level messages
 *
 *       Table 2. Syslog Message Severities
 *
 *
 * @author     Rafael Freitas
 * @date       Jan 31 2018
 *
 * @module lib/logger
 * @example
 * import logger from '/lib/logger'
 */

import winston from 'winston';
import cluster from 'cluster';
import path from 'path';
import moment from 'moment';
import colors from 'colors/safe';
// import wampMiddleware from './wamp-middleware'

const { logs: logsConfig } = config;

/**
 * Interface de log
 * @typedef {Object} Loggeraqui
 * @property {Function} debug - imprime no console marcado com DEBUG
 * @property {Function} info - imprime no console e grava no arquivo de log marcado com INFO
 * @property {Function} error - imprime no console e grava no arquivo de log marcado com ERROR
 * @property {Function} warn - imprime no console e grava no arquivo de log marcado com WARN
 * @property {Function} verbose - imprime no console marcado com VERBOSE
 * @property {Function} silly - imprime no console marcado com SILLY
 * @property {Function} data - imprime no console e grava no arquivo de log marcado com DATA
 */

/**
 * Tipos de erros
 * @private
 * @type {Object}
 * @property {Object} levels
 * @property {Number} levels.error Erro
 * @property {Number} levels.warn Atenção
 * @property {Number} levels.info Informativo
 * @property {Number} levels.verbose Detalhado
 * @property {Number} levels.debug Depuração
 * @property {Number} levels.silly Rapido
 * @property {Number} levels.data Dados
 */
const loggerConfig = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    verbose: 3,
    debug: 4,
    silly: 5,
    data: 6
  },
  colors: {
    error: 'red',
    debug: 'blue',
    warn: 'yellow',
    data: 'grey',
    info: 'green',
    verbose: 'cyan',
    silly: 'magenta'
  }
};

const MAIN_WORKER = 'main';
const WORKER_ID = cluster.worker ? cluster.worker.id : MAIN_WORKER;

// set theme
colors.setTheme(loggerConfig.colors);

export function logname(dirname) {
  const rootdir = path.join(__dirname, '../../');
  return String(dirname).replace(rootdir, '');
}

function timestamp() {
  return moment().format('YYYY-MM-DD H:mm:ss');
}

/**
 * Cria um *container* de log
 * ```js
 * var log = imports.log.create('meu-script')
 * log.debug('Teste de debug no console') // 2016-11-24 20:16:17 [meu-script] DEBUG Teste de debug no console
 * log.error('Ocorreu um erro') // 2016-11-24 20:16:17 [meu-script] ERROR Ocorreu um erro
 * ```
 * @method create
 * @param  {string} container Default: `app`
 * @return {Logger}           Retorna uma instancia do Logger
 */
function createLogger(container = 'app') {
  const transports = [];

  transports.push(new winston.transports.Console({
    timestamp,
    formatter,
    colorize: true,
    level: 'data'
    // name: level+'-console'
  }));

  const logger = new winston.Logger({
    exitOnError: false,
    transports: transports,
    levels: loggerConfig.levels,
    colors: loggerConfig.colors
  });
  // logger.on('error', function (err) { /* Do Something */ })
  logger.emitErrs = true;
  // logger.setLevels(winston.config.syslog.levels)
  logger.setLevels(loggerConfig.levels);

  /**
   * logger.colors.
   * logger.ok()
   * logger.fail()
   */
  Object.assign(logger, {
    colors,
    ok: colors.green('[OK]'),
    fail: colors.red('[FAIL]')
  });

  // instalar o log.wamp.success e log.wamp.fail
  // wampMiddleware.middleware(logger)

  function formatter(options) {
    // Return string will be passed to logger.
    const level = colors[options.level];
    const log = [colors.gray(options.timestamp())];

    if (WORKER_ID !== MAIN_WORKER) {
      log.push(colors.gray(['[Worker ', WORKER_ID, ']'].join('')));
    }

    log.push(colors.cyan(['[', container, ']'].join('')));

    // adiciona o LEVEL do erro (INFO, DEBUG, LOG, ERROR)
    log.push(level(options.level.toUpperCase()));

    typeof options.message !== 'undefined' && log.push(options.message);

    if (options.meta && Object.keys(options.meta).length) {
      log.push('\n\t' + JSON.stringify(options.meta));
    }

    return log.join(' ');
  }

  return logger;
}

/*
    Exports interface
 */
/**
 * Interface padrão de logs
 * Usando *container* padrão `app`
 * ```js
 * const logger = require('app/logger')
 * const log = logger('meu-modulo')
 * log.debug('Teste de debug no console') // 2016-11-24 20:16:17 [app] DEBUG Teste de debug no console
 * log.error('Ocorreu um erro no app') // 2016-11-24 20:16:17 [app] ERROR Ocorreu um erro
 * ```
 * @method log
 */

export default createLogger;
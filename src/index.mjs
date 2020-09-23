import Application from './Application'
import logger, { logname } from 'logger'
import cluster from 'cluster'
import os from 'os'

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
const TOTAL_CPU_CORES = process.env.CLUSTER_MAX_FORKS || os.cpus().length

function createApplication (extraConfigs = {}) {
  // CLONE ENVOIRIMENT VALUES FOR CONFIG
  const config = Object.assign({}, process.env, extraConfigs)

  // default delay is 10 seconds
  if (typeof config.WAMP_CONNECTION_DELAY === 'undefined') {
    config.WAMP_CONNECTION_DELAY = 10
  }

  // create a logger default application instance for general logs
  const log = logger('application')

  // singleton global Application
  const application = new Application(Object.assign(
    // copy all envoirment variables and config values into application instance
    ...config, {
    logger: name => {
      return logger(logname(name))
    }
  }))

  if (config.WAMP_AUTOCONNECT) {
    log.info(`Trying to connect to WAMP SERVER in ${log.colors.yellow(config.WAMP_URL)} on realm: ${log.colors.yellow(config.WAMP_REALM)}`)
    //   // agendar para depois para que os outros modulos instalem o listener
    setTimeout(() => {
      application.connectWampServer()
    }, config.WAMP_CONNECTION_DELAY)
  } else {
    log.warn('WAMP connections is disabled. To enable set true "WAMP_AUTOCONNECT" on config or your envoirement')
  }
  return application
}

// debugger
const application = createApplication()

if (config.CLUSTER_ENABLED) {
  cluster.setMaxListeners(1000 * 10)
  if (cluster.isMaster) {
    console.log('Master process is running')

    cluster.setupMaster({
      args: ['--extensions', '.mjs']
    })

    // Fork workers - save cluster workers on application
    for (let i = 0; i < TOTAL_CPU_CORES; i++) {
      application.workers.push(cluster.fork())
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`)
      console.log('Starting a new worker')
      cluster.fork()
      // remover o worker que morreu
      if (application.workers.indexOf(worker) !== -1) {
        application.workers.splice(application.workers.indexOf(worker), 1)
      }
    })
  } else {
    console.log(`Worker ${cluster.worker.id}`)
    cluster.worker.setMaxListeners(1000 * 10)
  }
}
export default application

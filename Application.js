import { EventEmitter } from 'events'
import os from 'os'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { Worker, isMainThread, parentPort, workerData, threadId } from 'worker_threads'
import Route from './Route.js'
import logger from './logger/index.js'
import ApplicationError from './ApplicationError.js'
import WampAdapter from './WampAdapter.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const WORKERS_LENGTH = os.cpus().length

/**
 * @requires events
 * @description
 * Classe singleton que extende de EventEmitter (nativo) é o ponto de partida da sua aplicação.
 * Singleton Class that extends EventEmitter for support your application events based
 * @author Rafael Freitas
 * @date Set 23 2020
 */

class Application extends EventEmitter {

  /**
   * Conexao wamp via WampAdapter
   * @type {WampAdapter}
   */
  wamp = null

  /**
   * Configurações
   * @type {Object}
   */
  settings = {}

  workers = new Map()

  /**
   * Identificador de mensagem para workers
   */
  workersMessagesId = 0

  get session () {
    return this.wamp?.session
  }

  constructor () {
    super()

    if (Application.instance) {
      return Application.instance
    }
    Application.instance = this

    // configurar o maximo de listeners do EventEmitter
    this.setMaxListeners(10000 * 10)

    // default log for application
    this.log = logger('Application')
    
    this.settings = {}
  }

  /**
   * Setup and start the Application with custom settings
   * @param {Object} settings
   */
  setup (settings) {
    Object.assign(this.settings, settings)

    if (typeof settings.wamp === 'object') {
      this.connect(settings.wamp)
    }
  }

  start () {
    if (this.settings.use_worker_threads) {
      ApplicationError.assert(this.settings.worker_filepath, 'settings.A001: worker_filepath is required when use_worker_threads is enabled!')
      this.createWorkers()
    }
    // abrir conexao
    this.wamp.open()
  }

  createWorkers () {
    // imentantacao da thread main
    // throw new Error('Workers features not implemented yet')

    if (!isMainThread) {
      // this.log.info(`[worker ${threadId}] Worker is running and cannot create more workers`)
      return
    }

    for (let i = 0; i < WORKERS_LENGTH; i++) {
      this.createWorker()
    }
  }

  getIdleWorker () {
    for (const [worker, state] of this.workers) {
      if (!state.busy) {
        return worker
      }
    }
    return null
  }

  getNextMessageId () {
    ++this.workersMessagesId
    return 'mid' + this.workersMessagesId
  }

  createWorker () {
    
    const {worker_filepath} = this.settings

    const worker = new Worker(worker_filepath, {
      type: 'module'
    })

    this.workers.set(worker, { busy: false })

    this.log.info(`[worker ${threadId}] New Worker created ${worker.threadId}`)

    // worker.on('message', (message) => {
    //   logger.info(`Mensagem do worker ${worker.threadId}: ${message}`);
    // });
  
    // worker.on('error', (error) => {
    //   logger.error(`Erro no worker: ${error}`);
    // })
  
    worker.on('exit', (code) => {
      if (code !== 0) {
        this.log.error(`Worker parou com código de saída ${code}`)
      }

      // remover worker
      this.workers.delete(worker)
      // cria um novo worker
      this.createWorker()
    })
  }

  connect (settings = {}) {
    // if exist a opened session ignore. Close the active connection first
    if (this.session) {
      return console.warn('[application] There is a active WAMP connection. Close it first!')
    }

    if (this.settings.hasConnection) {
      return console.warn('[application] There is already a WAMP connection confugurated! By pass!')
    }

    this.wamp = new WampAdapter(settings)
    this.wamp.on('wamp.session.open', this.onSessionOpen.bind(this))
    this.wamp.on('wamp.session.close', this.onSessionClose.bind(this))

    this.settings.hasConnection = true
  }

  onSessionOpen (session) {
    this.emit('wamp.session.open', session)
    if (isMainThread) {
      process.nextTick(() => {
        this.emit('connected', session)
      })
    }
  }
  onSessionClose (reason, details) {
    this.emit('wamp.session.close', reason, details)

    if (isMainThread) {
      this.emit('disconnected', reason, details)
    }
  }

  /**
   * Attach a route for any wamp session starts on application
   * @param {Route} RouteClass 
   * 
   * Use:
   * application.attachRoute(class MyRoute extends Route {})
   */
  attachRoute (RouteClass) {

    ApplicationError.assert(Application.isSubclass(RouteClass, Route), `attachRoute.A001: RouteClass must extends Route`)

    if (this.wamp?.isOpen) {
      RouteClass._attachToSession(this.wamp.session)
    } else {
      this.on('wamp.session.open', (session => {
        RouteClass._attachToSession(session)
      }))
    }
  }

  /**
   * Attach the Agent (protocol processor) RPC route for a Crossbar.io session when it's connected
   * This route is a bridge to link the client application for backend.
   */
  attachAgentToSession () {
    console.log('[INFO] Waiting a WAMP session begins to attach an Agent RPC route')
    this.on('wamp.session.open', (session, details) => {
      const agentSessionRouteName = `agent.${session.id}`
      // register an Agent RPC procedure for the current session
      session.register(agentSessionRouteName, (args, kwargs, details) => {
        console.warn(`[WARN] Backend Agent is disabled for this backend session (${agentSessionRouteName})! Try to call directly`)
      })
    })
  }

  static isSubclass(childClass, parentClass) {
    let proto = Object.getPrototypeOf(childClass.prototype);
    while (proto) {
      if (proto === parentClass.prototype) {
        return true;
      }
      proto = Object.getPrototypeOf(proto);
    }
    return false;
  }
}

export default new Application()
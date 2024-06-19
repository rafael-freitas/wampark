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

const WORKERS_MAX = WORKERS_LENGTH + 1

/**
 * @requires events
 * @description
 * Classe singleton que extende de EventEmitter (nativo) é o ponto de partida da sua aplicação.
 * Singleton Class that extends EventEmitter for support your application events based
 * @author Rafael Freitas
 * @date Set 23 2020
 */

export class DevkitApplication extends EventEmitter {

  status = 'created'

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

  /**
   * Plugins acoplados
   */
  plugins = new Map()

  workers = new Map()

  /**
   * Identificador de mensagem para workers
   */
  workersMessagesId = 0

  /**
   * Fila de tarefas para os workers
   */
  workersTaskQueue = []
  workersTaskBusy = new Map()

  get session () {
    return this.wamp?.session
  }

  constructor () {
    super()

    // configurar o maximo de listeners do EventEmitter
    this.setMaxListeners(10000 * 10)

    // default log for application
    this.log = logger('Application')
    
    this.settings = {}

    // carregar variaveis de ambiente para o settings
    Object.assign(this.settings, process.env)
  }

  plugin (plugin) {
    if (typeof plugin.install === 'function') {
      plugin.install()
      this.plugins.set(plugin, {installed: true})
    }
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

  startPlugins () {
    for (const [plugin, state] of this.plugins) {
      if (!state.started && typeof plugin.start === 'function') {
        plugin.start()
        this.plugins.set(plugin, {installed: true, started: true})
      }
    }
  }

  start () {
    if (this.settings.use_worker_threads) {
      ApplicationError.assert(this.settings.worker_filepath, 'settings.A001: worker_filepath is required when use_worker_threads is enabled!')
      this.createWorkers()
    }
    this.startPlugins()

    // abrir conexao
    if (this.wamp instanceof WampAdapter) {
      this.wamp.open()
    }

    this.emit('start')

    this.status = 'ready'
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

  createWorker (safe = false) {
    
    const {worker_filepath} = this.settings

    const worker = new Worker(worker_filepath, {
      type: 'module'
    })

    this.workers.set(worker, { busy: false, safe })

    this.log.info(`[worker ${threadId}] New Worker created ${worker.threadId}`)

    worker.on('message', (message) => {
      const {id, result, error} = message
      // this.log.info(`[worker ${threadId}] Handling message from worker ${worker.threadId}`)
      
      this.workers.set(worker, { busy: false, safe })
      this.assignNextWorkerTask()

      if (this.workersTaskBusy.has(id)) {
        let task = this.workersTaskBusy.get(id)
        // this.log.info(`[worker ${threadId}] Handling TASK from worker ${worker.threadId}`)
        this.workersTaskBusy.delete(id)
        if (error) {
          return task.reject(ApplicationError.parse(error))
        }
        task.resolve(result)
        // task.callback(error, result)
      }
    })
  
    worker.on('error', (error) => {
      error = ApplicationError.parse(error)

      const {id} = error

      this.log.error(`[worker ${worker.threadId}] Erro no worker: ${error.message}`)
      this.workers.set(worker, { busy: false, safe })
      this.assignNextWorkerTask()
      
      // rejeitar promise do endpoint do _callWorkersEndpoint()
      if (this.workersTaskBusy.has(id)) {
        let task = this.workersTaskBusy.get(id)
        // this.log.info(`[worker ${threadId}] Handling TASK from worker ${worker.threadId}`)
        this.workersTaskBusy.delete(id)
        task.reject(ApplicationError.parse(error))
      }
    })
  
    worker.on('exit', (code) => {
      if (code !== 0) {
        this.log.error(`Worker parou com código de saída ${code}`)
      }

      // remover worker
      this.workers.delete(worker)
      // cria um novo worker
      this.createWorker(safe)
    })
  }
  assignWorkerTask(task) {
    const worker = this.getIdleWorker()
    if (worker) {
      // verificar se o worker atual é o safe (desatolador da fila)
      let state = this.workers.get(worker)
      if (state.safe) {
        // manter sempre o worker safe disponivel
        this.workers.set(worker, { busy: false, safe: true })
      }
      else {
        this.workers.set(worker, { busy: true, safe: false })
      }

      // guardar o worker em caso de exit rejeitar o request
      task.worker = worker

      this.workersTaskBusy.set(task.id, task)
      worker.postMessage({
        id: task.id,
        payload: task.payload
      })
    } else {
      // Adicionar a tarefa à fila se não houver Workers ociosos
      this.workersTaskQueue.push(task)
      this.log.warn(`No idle workers available, task added to queue task id (${task.id}). BUSY WORKERS: ${this.workers.size}`)
      
      // precisa de mais 1 worker para liberar a fila
      if (this.workersTaskBusy.size === WORKERS_LENGTH) {
        if (this.workersTaskBusy.size < WORKERS_MAX) {
          this.createWorker(true)
        }
        this.log.warn(`No idle workers available, create a new worker to save the stack`)
      }
    }
  }

  assignNextWorkerTask() {
    // apenas tasks que nao foram enviadas ainda
    if (this.workersTaskQueue.length > 0) {
      const nextTask = this.workersTaskQueue.shift()
      this.assignWorkerTask(nextTask)
    }
  }

  sendMessageToWorker(task) {
    const id = this.getNextMessageId()
    task.id = id
    this.assignWorkerTask(task)
    return id
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
    if (!childClass.prototype) {
      return false
    }
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

class Application extends DevkitApplication {
  constructor() {
    super();
    if (Application.instance) {
      return Application.instance
    }
    Application.instance = this
  }
}

export default new Application()
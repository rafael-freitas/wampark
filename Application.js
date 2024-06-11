import { EventEmitter } from 'events'
import logger from './logger/index.js'

import ApplicationError from './ApplicationError.js'
import WampAdapter from './WampAdapter.js'
import Route from './Route.js'

function isSubclass(childClass, parentClass) {
  let proto = Object.getPrototypeOf(childClass.prototype);
  while (proto) {
    if (proto === parentClass.prototype) {
      return true;
    }
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}

/**
 * @requires events
 * @description
 * Classe singleton que extende de EventEmitter (nativo) é o ponto de partida da sua aplicação.
 * Singleton Class that extends EventEmitter for support your application events based
 * @author Rafael Freitas
 * @date Set 23 2020
 */

class Application extends EventEmitter {

  get session () {
    return this.wamp.adapter?.session
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

    /**
     * Conexao wamp
     */
    this.wamp = {}

    // Object.freeze(this)
  }

  /**
   * Setup and start the Application with custom settings
   * @param {Object} settings
   */
  setup (settings) {
    Object.assign(this.settings, settings)
  }

  connectToWampServer (settings = {}) {
    // if exist a opened session ignore. Close the active connection first
    if (this.wamp.session) {
      return console.warn('[application] There is a active WAMP connection. Close it first!')
    }

    this.wamp.adapter = new WampAdapter(settings)
    this.wamp.adapter.on('wamp.session.open', this.onSessionOpen.bind(this))
    this.wamp.adapter.on('wamp.session.close', this.onSessionClose.bind(this))

    // abrir conexao
    this.wamp.adapter.open()
  }

  onSessionOpen (session) {
    this.emit('wamp.session.open', session)
    process.nextTick(() => {
      this.emit('connected', session)
    })
  }
  onSessionClose (reason, details) {
    this.emit('wamp.session.close', reason, details)
  }

  /**
   * Attach a route for any wamp session starts on application
   * @param {Route} RouteClass 
   * 
   * Use:
   * application.attachRoute(class MyRoute extends Route {})
   */
  attachRoute (RouteClass) {

    ApplicationError.assert(isSubclass(RouteClass, Route), `attachRoute.A001: RouteClass must extends Route`)

    if (this.wamp.adapter?.isOpen) {
      RouteClass._attachToSession(this.wamp.adapter.session)
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
}

export default new Application()
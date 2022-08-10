import { EventEmitter } from 'events'
import errors from './errors/index.js'
import logger from './logger/index.js'
import { connect } from './wamp-adapter/index.js'

/**
 * @requires events
 * @description
 * Classe singleton que extende de EventEmitter (nativo) é o ponto de partida da sua aplicação.
 * Singleton Class that extends EventEmitter for support your application events based
 * @author Rafael Freitas
 * @date Set 23 2020
 */

class Application extends EventEmitter {

  constructor (properties = {}) {
    super()

    this.applicationId = Math.random().toString()

    // all configuration values
    this.config = {
      /**
       * Enable cluster feature?
       */
      cluster: false
    }

    // default log for application
    this.log = logger('application')

    this.setMaxListeners(1000 * 10)

    // attach logger and others values as Application instance properties
    Object.assign(this, { logger }, properties)

    // attach Errors interface as Application instance properties
    Object.assign(this, errors)

    // Store clusters works
    this.workers = []

    // WAMP connection instance
    this.wampConnection = null

    // the current WAMP (crossbar/autobahn) active and connected session
    this.currentSession = null

    // Attached Route instances in your application
    this.routes = []
  }

  /**
   * Setup the Application with custom properites like config
   * @param {Object} properties 
   */
  setup (properties) {
    // just apply new properties for this Application instance
    Object.assign(this, properties)
  }

  /**
   * Attach the Agent (protocol processor) RPC route for a Crossbar.io session when it's connected
   * This route is a bridge to link the client application for backend.
   */
  attachAgentRouteToSession () {
    console.log('[INFO] Waiting a WAMP session begins to attach an Agent RPC route')
    this.on('wamp.session.start', (session, details) => {
      const agentSessionRouteName = `agent.${session.id}`
      // register an Agent RPC procedure for the current session
      session.register(agentSessionRouteName, (args, kwargs, details) => {
        console.warn(`[WARN] Backend Agent is disabled for this backend session (${agentSessionRouteName})! Try to call directly`)
      })
    })
  }

  connectWampServer (settings = {}) {
    // if exist a opened session ignore. Close the active connection first
    if (this.currentSession) {
      return console.warn('[application] There is a active WAMP connection. Close it first!')
    }
    this.wampConnection = connect(Object.assign({
      url: this.config.WAMP_URL,
      realm: this.config.WAMP_REALM,
      authid: this.config.WAMP_AUTHID,
      authpass: this.config.WAMP_AUTHPASS,
      authmethods: [typeof this.config.WAMP_AUTHMETHODS === 'string' ? this.config.WAMP_AUTHMETHODS.split(',') : 'wampcra'],
      onopen: (session) => {
        this.isWampConnected = true
        this.emit('wamp.session.start', session)
        this.currentSession = session
      },
      onclose: (reason, details) => {
        this.isWampConnected = false
        this.emit('wamp.session.close', reason, details)
        this.currentSession = null
      }
    }, settings))
  }

  /**
   * Attach a route for any wamp session starts on application
   * @param {Route} route 
   * 
   * Use:
   * application.attachRoute(class MyRoute extends Route {})
   */
  attachRoute (route) {
    if (this.isWampConnected) {
      route.attach(this.currentSession)
    } else {
      this.on('wamp.session.start', (session => {
        route.attach(session)
      }))
    }
  }
  /**
   * Set current session or new session when wamp is connected to a route
   * @param {Route} route 
   */
  setSession (route) {
    if (this.isWampConnected) {
      route.setSession(this.currentSession)
    } else {
      this.on('wamp.session.start', (session => {
        route.setSession(session)
      }))
    }
  }
}

export default new Application()
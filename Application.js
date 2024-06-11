import { EventEmitter } from 'events'
import logger from './logger/index.js'

import ApplicationError from './ApplicationError.js'
import WampAdapter from './WampAdapter.js'
import Route from './Route.js'

/**
 * @requires events
 * @description
 * Classe singleton que extende de EventEmitter (nativo) é o ponto de partida da sua aplicação.
 * Singleton Class that extends EventEmitter for support your application events based
 * @author Rafael Freitas
 * @date Set 23 2020
 */

class Application extends EventEmitter {

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

    // abrir conexao
    this.wamp.adapter.open()


    // this.wampConnection = connect(Object.assign({
    //   url: this.config.WAMP_URL,
    //   realm: this.config.WAMP_REALM,
    //   authid: this.config.WAMP_AUTHID,
    //   authpass: this.config.WAMP_AUTHPASS,
    //   authmethods: [typeof this.config.WAMP_AUTHMETHODS === 'string' ? this.config.WAMP_AUTHMETHODS.split(',') : 'wampcra'],
    //   onopen: (session) => {
    //     this.isWampConnected = true
    //     this.emit('wamp.session.start', session)
    //     this.currentSession = session
    //   },
    //   onclose: (reason, details) => {
    //     this.isWampConnected = false
    //     this.emit('wamp.session.close', reason, details)
    //     this.currentSession = null
    //   }
    // }, settings))
  }

  onSessionOpen (session) {
    
  }
  onSessionClose (reason, details) {

  }

  /**
   * Attach a route for any wamp session starts on application
   * @param {Route} route 
   * 
   * Use:
   * application.attachRoute(class MyRoute extends Route {})
   */
  attachRoute (route) {

    ApplicationError.assert(route instanceof Route, `attachRoute.A001: route must to be a instance of Route`)

    if (this.wamp.adapter?.isOpen) {
      route.attach(this.wamp.adapter.currentSession)
    } else {
      this.on('wamp.session.open', (session => {
        route.attach(session)
      }))
    }
  }
  /**
   * Set current session or new session when wamp is connected to a route
   * @param {Route} route 
   */
  // setSession (route) {
  //   if (this.isWampConnected) {
  //     route.setSession(this.currentSession)
  //   } else {
  //     this.on('wamp.session.start', (session => {
  //       route.setSession(session)
  //     }))
  //   }
  // }

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
}

export default new Application()
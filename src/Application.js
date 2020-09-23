import { EventEmitter } from 'events'
import errors from '../error'
import { connect } from 'wamp-adapter'

/**
 * @requires events
 * @description
 * Classe singleton que extende de EventEmitter (nativo) é o ponto de partida da sua aplicação.
 * Singleton Class that extends EventEmitter for support your application events based
 * @author Rafael Freitas
 * @date Set 23 2020
 */

export default class Application extends EventEmitter {
  constructor (properties = {}) {
    super()

    this.setMaxListeners(1000 * 10)
    Object.assign(this, {}, properties)
    // attach Errors interface
    Object.assign(this, errors)

    // Store clusters works
    this.workers = []

    // WAMP connection instance
    this.wamp = null
  }

  connectWampServer () {
    this.wamp = connect({
      url: this.WAMP_URL,
      realm: this.WAMP_REALM,
      authid: this.WAMP_AUTHID,
      authpass: this.WAMP_AUTHPASS,
      authmethods: [typeof this.WAMP_AUTHMETHODS === 'string' ? this.WAMP_AUTHMETHODS.split(',') : 'wampcra'],
      onopen: (session) => {
        this.emit('wamp.session.start', session)
        this.currentSession = session
      },
      onclose: (reason, details) => {
        this.emit('wamp.session.close', reason, details)
        this.currentSession = null
      }
    })
  }
}


/**
* ******************************************************************************************************
*
*   ApplicationAgent
*
*     Classe para interface de comunicação do protocolo da aplicação
*
*
*   @author     Rafael Freitas
*   @date       Apr 2 2018
*
*   @class Route
*   @memberof module:lib/agent
*
* ******************************************************************************************************
*/

import application from '../application'

// const logger = require('app/lib/logger')

export default class Agent {
  constructor () {
    this.attachWampSession()
    this.$session = null
  }

  attachWampSession () {
    console.log('[INFO] attaching Agent to session')
    application.on('wamp.session.start', (session, details) => {
      this.$session = session
      const agentSessionRoute = `agent.${session.id}`
      session.register(agentSessionRoute, (args, kwargs, details) => {
        console.warn(`[WARN] Backend Agent is disabled for this backend session (${agentSessionRoute})! Try to call directly`)
      })
    })
  }
}

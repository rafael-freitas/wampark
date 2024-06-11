// import app from 'index'

import application, { ApplicationError } from '../index.js'
import MyRouteSample from './MyRouteSample.js'
import CallMyRouteSample from './CallMyRouteSample.js'
import SampleRouteAfterConnection from './SampleRouteAfterConnection.js'

const PORT = 9001
const HOSTNAME = 'localhost'
const WAMP_URL = `ws://${HOSTNAME}:${PORT}/ws`
const WAMP_REALM = 'realm1'
const WAMP_AUTHID = 'backend-service-user'
const WAMP_AUTHPASS = 'authP4555ec3tB4ck'


application.setup({
  // nao usar multi threads
  use_worker_threads: false
})

application.attachRoute(MyRouteSample)
application.attachRoute(CallMyRouteSample)

application.connectToWampServer({
  url: WAMP_URL,
  realm: WAMP_REALM,
  authid: WAMP_AUTHID,
  authpass: WAMP_AUTHPASS,
})

// application.on('wamp.session.open', (session) => {
//   session.call('routes.callMyRouteSample')
// })
application.on('connected', (session) => {
  // application.attachRoute(SampleRouteAfterConnection)
  application.session.call('routes.callMyRouteSample')
  // application.session.call('routes.sampleRouteAfterConnection').catch(err => {
  //   let error = ApplicationError.parse(err)
  //   console.error('ERRO', err, error)
  // })
})

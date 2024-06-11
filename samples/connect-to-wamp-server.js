// import app from 'index'

import application from '../index.js'
import MyRouteSample from './MyRouteSample.js'

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

application.attachRoute(new MyRouteSample())

application.connectToWampServer({
  url: WAMP_URL,
  realm: WAMP_REALM,
  authid: WAMP_AUTHID,
  authpass: WAMP_AUTHPASS,
})

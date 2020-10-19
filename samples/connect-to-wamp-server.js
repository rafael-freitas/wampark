// import app from 'index'

import application from '../src/index'
import MyRouteSample from './MyRouteSample'

const PORT = 9000
const HOSTNAME = 'localhost'
const WAMP_URL = `ws://${HOSTNAME}:${PORT}/ws`
const WAMP_REALM = 'realm1'
const WAMP_AUTHID = 'backend-service-user'
const WAMP_AUTHPASS = 'authP4555ec3tB4ck'

application.attachRoute(MyRouteSample)


application.connectWampServer({
  url: WAMP_URL,
  realm: WAMP_REALM,
  authid: WAMP_AUTHID,
  authpass: WAMP_AUTHPASS,
})


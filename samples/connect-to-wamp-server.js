// import app from 'index'
import { fileURLToPath } from 'url'
import application, { ApplicationError } from '../index.js'
import MyRouteSample from './MyRouteSample.js'
import CallMyRouteSample from './CallMyRouteSample.js'
import SampleRouteAfterConnection from './SampleRouteAfterConnection.js'
import { isMainThread } from 'worker_threads'

const __filename = fileURLToPath(import.meta.url)

const PORT = 9001
const HOSTNAME = 'localhost'
const WAMP_URL = `ws://${HOSTNAME}:${PORT}/ws`
const WAMP_REALM = 'realm1'
const WAMP_AUTHID = 'backend-service-user'
const WAMP_AUTHPASS = 'authP4555ec3tB4ck'


application.setup({
  // nao usar multi threads
  use_worker_threads: true,
  worker_filepath: __filename,

  // Modo de configuração de conexão 1
  wamp: {
    url: WAMP_URL,
    realm: WAMP_REALM,
    authid: WAMP_AUTHID,
    authpass: WAMP_AUTHPASS,
  }
})

// Modo de configuração de conexão 2
// application.connect({
//   url: WAMP_URL,
//   realm: WAMP_REALM,
//   authid: WAMP_AUTHID,
//   authpass: WAMP_AUTHPASS,
// })

// evento disparado quando a conexao foi estabelecida 1
// application.on('wamp.session.open', (session) => {
//   session.call('routes.callMyRouteSample')
// })



application.attachRoute(MyRouteSample)
application.attachRoute(CallMyRouteSample)


application.start()


if (isMainThread) {
  // evento disparado quando a conexao foi estabelecida 2
  application.on('connected', (session) => {
    // application.attachRoute(SampleRouteAfterConnection)
    

    for (let x = 0; x < 1; x++) {
      // console.log(`call ${x}`)
      application.session.call('routes.callMyRouteSample', [], {
        counter: x
      }).catch(err => {
        let error = ApplicationError.parse(err)
        // console.log(`Erro capturado ----->`, error)
      })
    }
    // application.session.call('routes.sampleRouteAfterConnection').catch(err => {
    //   let error = ApplicationError.parse(err)
    //   console.error('ERRO', err, error)
    // })
  })
}
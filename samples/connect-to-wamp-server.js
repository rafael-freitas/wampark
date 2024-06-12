// import app from 'index'
import { fileURLToPath } from 'url'
import application, { ApplicationError } from '../index.js'
import MyRouteSample from './MyRouteSample.js'
import CallMyRouteSample from './CallMyRouteSample.js'
// import SampleRouteAfterConnection from './SampleRouteAfterConnection.js'
import { isMainThread } from 'worker_threads'

const __filename = fileURLToPath(import.meta.url)

application.setup({
  // nao usar multi threads
  use_worker_threads: process.env.USE_WORKER_THREADS === 'true',
  worker_filepath: __filename,

  // Crossbar.io
  wamp: {
    url: process.env.WAMP_URL,
    realm: process.env.WAMP_REALM,
    authid: process.env.WAMP_AUTHID,
    authpass: process.env.WAMP_AUTHPASS,
  }
})


application.attachRoute(MyRouteSample)
application.attachRoute(CallMyRouteSample)


application.start()


if (isMainThread) {
  // evento disparado quando a conexao foi estabelecida 2
  application.on('connected', (session) => {
    // application.attachRoute(SampleRouteAfterConnection)
    

    for (let x = 0; x < 10; x++) {
      // console.log(`call ${x}`)
      application.session.call('routes.callMyRouteSample', [], {
        counter: x
      }).catch(err => {
        let error = ApplicationError.parse(err)
        console.log(`Erro capturado ----->`, error)
      })
    }
    // application.session.call('routes.sampleRouteAfterConnection').catch(err => {
    //   let error = ApplicationError.parse(err)
    //   console.error('ERRO', err, error)
    // })
  })
}
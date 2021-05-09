
/**
* ******************************************************************************************************
*
*   WebRoute
*
*     Classe de rota para protocolo HTTP sobre Express
*     Todas as rotas devem herdar de WebRoute
*
*
*   @author     Rafael Freitas
*   @date       Feb 13 2018
*
*   @memberof module:lib/routes
*   @class WebRoute
*   @extends Route {@link module:lib/routes.Route}
*
* ******************************************************************************************************
*/

import express from 'express'
import { isEmpty, isFunction, defaults } from 'lodash'

import RouteTypes from './RouteTypes'
import Route from './Route'
import jsonError from './middlewares/jsonerror'
import cluster from 'cluster'

// const logger = require('app/lib/logger')

const _defaults = {
  type: RouteTypes.ALL,
  options: {},
  view: '',
  path: null,
  middleware: []
}

export default class WebRoute extends Route {
  constructor (properties = {}) {
    super(...arguments)

    properties = defaults(this, _defaults, {
      router: express.Router()
    })

    Object.assign(this, properties)

    const { uri } = this

    if (isEmpty(uri)) {
      throw new ReferenceError('Propriedade "uri" requirido', __filename)
    }
  }

  render (response, data = {}) {
    if (this.view) {
      response.vueRender(this.view, Object.assign({}, this, data))
      return
    }
    this.json(response, data)
  }

  static attach (server, forcePath = null) {
    const route = new this()

    let { type, endpoint, uri, router, path } = route

    // se o type for invalido usar o metodo ALL
    if (!isFunction(router[type])) {
      type = RouteTypes.ALL
    }

    path = forcePath || path

    // adicionar middleware padrao de tratamento de erros
    route.middleware.push(jsonError)

    // bypass no master
    // if (cluster.isMaster) {
    //   return route
    // }

    if (path !== null) {
      const method = router[type]
      method.apply(router, [uri].concat(route.middleware, [endpoint.bind(route)]))
      server.use(path, router)
    } else {
      const method = server[type]
      method.apply(server, [uri].concat(route.middleware, [endpoint.bind(route)]))
    }

    route.onAttachSuccess()
    route.printLogAttachSuccess()

    return route
  }

  /**
   * endpoint - Description
   *
   * @param {type} request  Description
   * @param {type} response Description
   *
   * @returns {type} Description
   */
  endpoint (request, response) {}
}

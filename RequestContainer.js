
/**
* ******************************************************************************************************
*
*   RequestContainer
*
*     Sandbox para requisições
*
*
*   @author     Rafael Freitas
*   @date       2024-06-10 18:53:57
*
*   @class Route
*   @memberof module:routes
*   @requires {@link module:Routes}
*
* ******************************************************************************************************
*/

import Component from './Component.js'

export default class RequestContainer {

  get session () {
    return this.__route.session
  }

  constructor (route) {
    this.__route = route
  }

  /**
   * Create a client side UI component interface
   * @param {String} querySelector Browser document.querySelector() arg
   * @param {Boolean} http Is a http request? 
   * @returns 
   */
  getComponentBySelector (querySelector, http = false) {
    const component = new Component(querySelector, this)
    component.$http = !!http
    return component
  }

  /**
   * endpoint - metodo chamado a cada request da rota
   * @param {Object} request 
   */
  endpoint (request = {args: [], kwargs: {}, details: {}}) {

  }
}

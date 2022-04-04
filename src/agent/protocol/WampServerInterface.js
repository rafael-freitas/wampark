
export default class WampServerInterface {
  constructor (component) {
    this.component = component
  }

  /**
   *
   * @param {String} uri Nome da rota RPC registrada no WAMP
   * @param {Object} kwargs Payload da rota
   * @param {RouteProtocol} options Configurar usuario destino ou session de destino atraves de `targetSession` e `targetUser`
   */
  call (uri, kwargs = {}, options = {}) {
    return this.component.method('$server.call', uri, kwargs, options)
  }

  subscribeBroadcast (uri) {
    return this.component.method('$server.subscribeBroadcast', uri)
  }
}

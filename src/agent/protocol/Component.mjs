import WampServerInterface from './WampServerInterface'
import { ApplicationError } from '../../errors'

/**
 * Representação de componentes da UI em VueJS
 *
 *
 * @author     Rafael Freitas
 * @date       Out 06 2018
 * @module lib/agent
 */

export default class Component {
  constructor (clientApplication, routeProtocol = {}) {
    this.$clientApplication = clientApplication
    // carrega as configuracoes para o Agent do client
    // ex: _querySelector do component
    this.$routeProtocol = routeProtocol

    this.$server = new WampServerInterface(this)

    // redirecionar qualquer outra propriedade para method()
    return new Proxy(this, {
      get: function (component, field) {
        if (field === 'then') {
          return component
        }
        if (field in component) return component[field] // normal case
        return component.method.bind(component, field)
      }
    })
  }

  /**
   * Manter compatibilidade com a serialização do retorno do endpoint da Route
   * antes de enviar para o Crossbar, evitando o Proxy()
   */
  toJSON () {
    return {
      ...this.$routeProtocol
    }
  }

  $t (text = '') {
    ApplicationError.assert(text, 'ER001: Configure uma string para ser traduzida')

    return this.$clientApplication.plugin('execComponentMethod', {
      method: '$t',
      args: [text]
    }, this.$routeProtocol)
  }

  method (method, ...args) {
    return this.$clientApplication.plugin('execComponentMethod', { method, args }, this.$routeProtocol)
  }

  addComponent (filepath) {
    return this.$clientApplication.plugin('addComponent', { component: filepath }, this.$routeProtocol)
  }

  awaitEvent (name) {
    return this.$clientApplication.plugin('eventListener', { name }, this.$routeProtocol)
  }

  setData (path, value) {
    return this.$clientApplication.plugin('setData', { path, value }, this.$routeProtocol)
  }

  getData (path) {
    return this.$clientApplication.plugin('getData', { path }, this.$routeProtocol)
  }

  /**
   * Obter ou setar um valor de uma propriedade do componente
   * Ex: component.nome onde nome é uma propriedade de data: {} ou props: {}
   *
   * @param  {String} name nome da propriedade do componente. Ex: this.nomeCliente
   * @param  {Mixed} value Se value nao for informado será executado o getData()
   * @return {Promise}
   */
  data (name, value) {
    if (typeof value !== 'undefined') {
      return this.setData(name, value)
    }
    return this.getData(name)
  }
}

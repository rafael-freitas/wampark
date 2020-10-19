import Component from './Component'
/**
 * Manipulação da Store na aplicação lado cliente
 *
 *
 * @author     Rafael Freitas
 * @date       Jul 10 2018
 * @update     30 Mar 2019
 * @module lib/agent
 */
export default class Store extends Component {
  constructor (...args) {
    super(...args)
    this.$routeProtocol.querySelector = '#app'
    this.$routeProtocol.isRootComponent = true
  }

  commit (name, payload) {
    return this.$clientApplication.plugin('storeCommit', {
      commit: name,
      payload
    }, this.$routeProtocol)
  }
}

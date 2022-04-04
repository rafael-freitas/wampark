import Component from './Component'
/**
 * Manipulação da Store na aplicação lado cliente
 *
 *
 * @author     Rafael Freitas
 * @date       Jul 10 2018
 * @module lib/agent
 */
export default class Store extends Component {
  constructor (...args) {
    super(...args)
    const [route = {}] = args

    this.$routeProtocol.isRootComponent = true

    this.$session = route.routeProtocol.fromSession
  }

  commit (name, payload, config = {}) {
    const { publishAll = true } = config
    const options = Object.assign({}, this.$routeProtocol)

    if (!publishAll && this.$session) {
      options.eligible = [this.$session]
    }

    return this.$clientApplication.plugin('storeCommit', {
      commit: name,
      payload
    }, options)
  }
}

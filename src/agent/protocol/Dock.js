import Component from './Component'
import { v3 as uuidv3 } from 'uuid'
import { ApplicationError } from '../../errors'
/**
 * Representação de componentes da UI em VueJS
 *
 *
 * @author     Rafael Freitas
 * @date       Apr 25 2018
 * @module lib/agent
 */

export default class Dock extends Component {
  constructor (...args) {
    super(...args)
    this.$routeProtocol.querySelector = '#dock'
  }

  async addTab (options) {
    if (!options.id) {
      options.id = uniqid()
    }
    options = await this.$clientApplication.plugin('execComponentMethod', {
      method: 'addTab',
      args: [options]
    }, this.$routeProtocol)

    return this.getTab(options)
  }

  filterTabs (predicate) {
    return this.$clientApplication.plugin('execComponentMethod', {
      method: 'filterTabs',
      args: [predicate]
    }, this.$routeProtocol)
  }

  activeTab (name) {
    return this.$clientApplication.plugin('execComponentMethod', {
      method: 'activeTab',
      args: [name]
    }, this.$routeProtocol)
  }

  closeTab (query) {
    return this.$clientApplication.plugin('execComponentMethod', {
      method: 'closeTab',
      args: [query]
    }, this.$routeProtocol)
  }

  /**
   * Retonar uma instancia de Component para a tab identificada por _uid codigo do component no Vue
   * @param tab options da tab
   */
  getTab (tab = {}) {
    const { _uid } = tab

    ApplicationError.assert(_uid, '"tab" precisa ser um objeto contendo a propriedade _uid')

    return this.$clientApplication.component({ _uid })
  }

  /**
   * Garante abrir apenas uma vez a tab
   * @param  {Object}  options
   * @return {Component} Retorna o ComponentVue da Tab
   */
  async pinTab (options) {
    const { component, prefix = '' } = options
    // uuid:empresa
    const name = uuidv3(component, uuid.URL) + ':' + prefix
    const tabList = await this.filterTabs({ name })
    const [tabConfig] = tabList

    if (tabConfig) {
      this.activeTab(tabConfig.name)

      return this.getTab(tabConfig)
    }

    return this.addTab({
      name,
      ...options
    })
  }
}

function uniqid () {
  return Math.floor((1 + Math.random()) * 0x1000000)
}

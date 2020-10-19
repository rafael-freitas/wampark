import Component from './Component'
/**
 * Representação de componentes da UI em VueJS
 *
 *
 * @author     Rafael Freitas
 * @date       Apr 25 2018
 * @module lib/agent
 */

export default class Workspace extends Component {
  constructor (...args) {
    super(...args)
    this.$routeProtocol.querySelector = '#workspace'
  }

  async openDrawer (options) {
    const drawerOptions = await this.$clientApplication.plugin('execComponentMethod', {
      method: 'openDrawer',
      args: [options]
    }, this.$routeProtocol)

    // extrair o _uid do ComponentVue que foi renderizado dentro do Drawer
    // ele contem o metodo $_closeDrawer() que vem mixin-drawers
    const { _uid } = drawerOptions

    return this.$clientApplication.component({ _uid })
  }

  closeDrawer () {
    return this.$clientApplication.plugin('execComponentMethod', {
      method: 'handleToggleDrawer',
      args: [false]
    }, this.$routeProtocol)
  }
}

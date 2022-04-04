import Component from './Component'
/**
 * Representação de componentes da UI em VueJS
 *
 *
 * @author     Rafael Freitas
 * @date       Out 06 2018
 * @module lib/agent
 */

export default class Dialogs extends Component {
  constructor (clientApplication, routeProtocol = {}) {
    super(clientApplication, routeProtocol)
  }

  async confirmRemoveDialog (options) {
    const dialog = await this.$clientApplication.addComponent('shared/components/dialogs/c-confirma-remocao-dialog')

    if (options) {
      await dialog.setOptions(options)
    }

    return dialog.awaitEvent('choice')
  }
}

import AgentError from './AgentError'

/**
 * Representação de componentes da UI em VueJS
 *
 *
 * @author     Rafael Freitas
 * @date       Apr 25 2018
 * @module lib/agent
 */

// const _defaults = {
//   uri: '',
//   name: '',
//   data: {},
//   context: {},
//   pid: '',
//   componentid: '',
//   component: '',
//   session: '',
//   targetSession: '',
//   user: '',
//   targetUser: '',
//   autoAssignSession: false,
//   broadcastSessions: '', // sessions do usuario
//   step: '',
//   states: []
// }
export default class Component {
  constructor (proc, properties) {
    this.$proc = proc
    this.$props = properties
    // this.$session = session
  }

  plugin (name, args, options = {}) {
    options = Object.assign(options, this.$props, args)
    // const { _cid, _uid, _elid, pid } = options
    return this.$proc.transport({
      ...options,
      plugin: name
    })
  }

  method (method, ...args) {
    return this.plugin('execComponentMethod', {
      method,
      args
    })
  }

  addTab (options) {
    return this.plugin('execComponentMethod', {
      method: 'addTab',
      args: [options]
    })
  }

  redirect (url) {
    return this.plugin('redirect', { url }, {
      _elid: 'app'
    })
  }

  message (options) {
    return this.plugin('message', { options })
  }

  notify (options) {
    const success = (message, title = 'Sucesso!') => {
      const option = {
        ...options,
        message,
        title,
        type: 'success'
      }

      return this.plugin('notify', { options: option })
    }

    const error = (message, title = 'Erro!') => {
      const option = {
        ...options,
        message,
        title,
        type: 'error'
      }

      return this.plugin('notify', { options: option })
    }

    const warn = (message, title = 'Cuidado!') => {
      const option = {
        ...options,
        message,
        title,
        type: 'warning'
      }

      return this.plugin('notify', { options: option })
    }

    const info = (message, title = 'Informação') => {
      const option = {
        ...options,
        message,
        title,
        type: 'info'
      }

      return this.plugin('notify', { options: option })
    }

    return {
      success,
      error,
      warn,
      info
    }
  }

  addComponent (options) {
    return this.plugin('addComponent', { options })
  }

  awaitEvent (options) {
    return this.plugin('eventListener', { ...options })
  }

  /**
   * Componente exibe um dialog de escolha travando o processo até que o usuário confirme ou cancele
   * o dialog.
   * @param {Object} options Propriedades de configuração do componente
   * @property {String} options.component Path para o componente que será exibido
   * @property {String} options.eventName Nome do evento que quando disparado irá dar continuidade no processo
   * @return {Process}
   */
  async dangerousChoice (options = {}) {
    const defaultOptions = {
      component: 'shared/components/dialogs/c-confirma-remocao-dialog',
      eventName: 'choice'
    }
    const mergedOptions = Object.assign(defaultOptions, options)
    const component = await this.addComponent(mergedOptions)
    const choice = await this.$proc.component(component).awaitEvent({ name: mergedOptions.eventName })

    if (!choice) {
      AgentError.cancelProc()
    }

    return this.$proc
  }
}

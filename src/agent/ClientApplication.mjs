/**
 * Processo da aplicação
 *
 *
 * @author     Rafael Freitas
 * @date       Apr 25 2018
 * @module lib/agent
 */

import AgentError from './AgentError'
import Component from './protocol/Component'
import Workspace from './protocol/Workspace'
import Dock from './protocol/Dock'
import Dialogs from './protocol/Dialogs'
import Store from './protocol/Store'
import WampServerInterface from './protocol/WampServerInterface'
import application from '../index'

export default class ClientApplication {
  constructor (routeProtocol) {
    this.routeProtocol = routeProtocol

    // metodo padrao de transporte (comunicacao com o Agent cliente)
    // usar como padrao o RPC para transportar o protocolo pro cliente
    // um call() via RPC para o Agent no cliente
    this.transport = this.rpcTransport

    this.$server = new WampServerInterface(this.root)
  }

  /**
   * Criar uma instancia para uma session de requisição
   *
   * @param  {Object} routeProtocol endpoint.details.caller
   * @return {ClientApplication}
   */
  static create (routeProtocol) {
    return new this(routeProtocol)
  }

  /**
  * Metodo de transport (comunicacao com o Agent cliente) via RPC
  *
  * @param {*} kwargs Carga de dados para processar no lado cliente pelo Agent
  *
  * @returns {Promise}
  */
  rpcTransport (kwargs, routeProtocol) {
    routeProtocol = Object.assign({}, this.routeProtocol, routeProtocol)

    const { targetSession } = routeProtocol
    if (!targetSession) {
      return Promise.reject(new AgentError('001: Nenhuma targetSession foi configurada'))
    }
    return application.currentSession.call(`agent.${targetSession}`, [routeProtocol], kwargs)
  }

  createPubsubTransport (route) {
    return (kwargs, routeProtocol = {}) => {
      return application.currentSession.publish(route, [Object.assign({}, this.routeProtocol, routeProtocol)], kwargs, routeProtocol)
    }
  }

  plugin (name, payload = {}, routeProtocol = {}) {
    return this.transport({
      plugin: name,
      payload
    }, routeProtocol)
  }

  broadcast (pubsubRouteName) {
    const app = new ClientApplication({
      isBroadcast: true,
      ...this.routeProtocol
    })

    // cria uma function clousure com a chamada do publish()
    // para ser usada no metodo plugin() por exemplo
    // configurando o metodo de transporte padrao do processo
    app.transport = this.createPubsubTransport(pubsubRouteName)

    // depois de configurado o transporte retorna o processo para
    // uso padrao
    return app
  }

  get dialogs () {
    return new Dialogs(this)
  }

  get workspace () {
    return new Workspace(this)
  }

  get dock () {
    return new Dock(this)
  }

  get store () {
    return new Store(this)
  }

  get root () {
    return this.component({ isRootComponent: true })
  }

  get notify () {
    const sendNotify = (options) => {
      return this.plugin('notify', { options }, { isRootComponent: true })
    }
    Object.assign(sendNotify, {
      success: (message, title = 'Sucesso!') => {
        return sendNotify({
          message,
          title,
          type: 'success'
        })
      },
      info: (message, title = 'Informação!') => {
        return sendNotify({
          message,
          title,
          type: 'info'
        })
      },
      error: (message, title = 'Erro!') => {
        return sendNotify({
          message,
          title,
          type: 'error'
        })
      },
      warning: (message, title = 'Atenção!') => {
        return sendNotify({
          message,
          title,
          type: 'warning'
        })
      }
    })
    return sendNotify
  }

  get currentComponent () {
    // codigo do component Vue na interface
    let { _uid, isRootComponent = false } = this.routeProtocol

    // se nao foi executado a partir de algum componente usar o componente root do app
    // isso acontece quando se executa uma $action()
    // TODO verificar pq a $action nao esta passando o componente atual na requisicao
    if (!_uid) {
      isRootComponent = true
    }

    return new Component(this, {
      _uid,
      isRootComponent
    })
  }

  component (selector) {
    const routeProtocol = {}
    if (typeof selector === 'object') {
      Object.assign(routeProtocol, selector)
    } else {
      Object.assign(routeProtocol, {
        querySelector: selector
      })
    }
    return new Component(this, routeProtocol)
  }

  redirect (url) {
    return this.plugin('redirect', {
      url,
      isRootComponent: true
    })
  }

  message (options) {
    return this.plugin('message', { options }, { isRootComponent: true })
  }

  /**
   * Adiciona um component no App.vue
   * Retorna uma instancia de Component do componente adicionado
   * @param  {String}  filepath Caminho do arquivo no cliente: p/a/t/h/arquivo.vue
   * @return {Component}
   */
  async addComponent (filepath) {
    const ref = await this.plugin('addComponent', { component: filepath }, { isRootComponent: true })
    return this.component(ref)
  }

  toJSON () {
    return {

    }
  }
}

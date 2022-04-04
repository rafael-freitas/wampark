/**
 * Processo da aplicação
 *
 *
 * @author     Rafael Freitas
 * @date       Apr 25 2018
 * @module lib/agent
 */

import { defaults } from 'lodash'
import { createHash } from 'crypto'
import AgentError from './AgentError'
import Component from './Component'
import Store from './Store'

const stateHashAlgo = 'md5'

function md5 (data) {
  return createHash(stateHashAlgo).update(data).digest('hex')
}

const _defaults = {
  _uri: '',
  _context: {},
  _pid: 0,
  _cid: '',
  _targetSession: '',
  _user: '',
  _targetUser: '',
  _autoAssignSession: false,
  _broadcastSessions: '', // sessions do usuario
  _states: []
}

export default class Process {
  constructor (properties, agent) {
    this.states = []
    this.$agent = agent
    this.$props = defaults(properties, _defaults)
    this.currentState = {}
    // this.$props._states.push(this.currentState)
    this.callsCounter = 0

    this.payload = this.$props.payload || {}
    this._pid = this.$props._pid

    // metodo padrao de transporte (comunicacao com o Agent cliente)
    // usar como padrao o RPC para transportar o protocolo pro cliente
    // um call() via RPC para o Agent no cliente
    this.transport = this.transportRPC
  }

  /**
  * Metodo de transport (comunicacao com o Agent cliente) via RPC
  *
  * @param {*} payload Carga de dados para processar no lado cliente pelo Agent
  *
  * @returns {Promise}
  */
  transportRPC (payload) {
    const { _targetSession } = payload
    if (!_targetSession) {
      return Promise.reject(new AgentError('CPa01: Nenhuma targetSession foi configurada'))
    }

    this.callsCounter++

    // cria um id para a atividade
    const stateId = md5(JSON.stringify(payload) + this.callsCounter)
    if (this.currentState[stateId]) {
      const { value } = this.currentState[stateId]
      if (typeof value !== 'undefined') {
        return Promise.resolve(value)
      }
    }
    const state = {
      payload
    }
    this.currentState[stateId] = state
    return this.$agent.$session.call(`agent.${_targetSession}`, [], payload)
      .then(value => {
        state.value = value
        return value
      })
  }

  createPubsubTransport (route) {
    return (payload) => {
      return this.$agent.$session.publish(route, [], payload)
    }
  }

  /**
  * session - Description
  *
  * @param {type} sessionid Description
  *
  * @returns {type} Description
  */
  session (sessionid) {
    this.targetSession = sessionid
    return this
  }

  component (selector = null) {
    if (typeof selector === 'object') {
      const { _cid } = selector
      if (_cid) {
        return new Component(this, { ...this.$props, _isRootComponent: false, ...selector, _useCid: true })
      }
    }
    if (selector) {
      return new Component(this, { ...this.$props, _isRootComponent: false, _elid: selector, _useElid: true })
    }
    return new Component(this, { ...this.$props })
  }

  workspace () {
    return new Component(this, { ...this.$props, _elid: 'workspace', _useElid: true })
  }

  app () {
    return new Component(this, { ...this.$props, _elid: 'app', _isRootComponent: true })
  }

  store () {
    return new Store(this, { ...this.$props, _isStore: true })
  }

  broadcast (pubsubRouteName) {
    const proc = new Process({ ...this.$props, _isBroadcast: true }, this.$agent)
    // cria uma function clousure com a chamada do publish()
    // para ser usada no metodo plugin() por exemplo
    // configurando o metodo de transporte padrao do processo
    proc.transport = this.createPubsubTransport(pubsubRouteName)

    // depois de configurado o transporte retorna o processo para
    // uso padrao
    return proc
  }

  toJSON () {
    return {

    }
  }
}

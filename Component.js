
function parseFunctionToString (obj) {
  if (Array.isArray(obj)) {
    for (let index = 0; index < obj.length; index++) {
      const value = obj[index];
      if (typeof value === 'function') {
        obj[index] = String(value)
      }
      else if (typeof value === 'object') {
        obj[index] = parseFunctionToString(value)
      }
    }
    return obj
  }
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      const element = obj[key]
      if (typeof element === 'function') {
        obj[key] = String(element)
      }
      else if (typeof element === 'object') {
        obj[key] = parseFunctionToString(element)
      }
      else if (Array.isArray(element)) {
        obj[key] = parseFunctionToString(element)
      }
    }
  }
  return obj
}

export default class Component {

  /**
   * @type {Route}
   */
  $route = null

  /**
   * 
   * @param {String} querySelector ID ou query para o documento.querySelector()
   * @param {Route} route instancia de Route
   * @param {Boolean} http indica se é uma requisicao http
   * @returns {Component}
   */
  constructor (querySelector, route, http = false) {
    this.$querySelector = querySelector
    this.$route = route
    this.$http = http
    this.$protocol = {
      http,
      querySelector,
      commands: []
    }

    this.$targetSessionId = this.$route._getTargetSessionId()

    // redirecionar qualquer outra propriedade para method()
    return new Proxy(this, {
      get: function (component, field) {
        // Promise
        if (field === 'then') {
          return component
        }
        if (field in component) return component[field] // normal case
        return component.method.bind(component, field)
      }
    })
  }

  toJSON () {
    return this.$protocol
  }

  method (name, ...args) {
    args = parseFunctionToString(args)
    if (this.$http === true) {
      this.$protocol.commands.push({
        method: name,
        args
      })
      return this
    }
    return this.$route.session.call(`agent.${this.$targetSessionId}`, [this.$protocol], {
      cmd: 'execComponentMethod',
      payload: {
        method: name,
        args
      }
    }).then(response => {
      if (typeof response === 'object' && response && response.$cmd === 'component') {
        return this.$route.getComponentBySelector(response.$id)
      }
      return response
    })
  }
}
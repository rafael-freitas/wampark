import ErrorTypes from './ErrorTypes.js'
import assert from 'assert'

/**
 * @requires {@link module:lib/errors.ErrorTypes}
 * @description
 * Prototipo de erro da aplicacao
 * Classe que extende de Error (nativo) e representa um erro no sistema.
 * Esta classe promove iterface para organização de erros e tratamento para o client,
 * convertendo para JSON os erros sendo possivel captura-los no clientside
 * @extends Error
 * @class ApplicationError
 * @author     Rafael Freitas
 * @date       Feb 13 2018
 * @memberof module:lib/errors
 * @example
 * // constructor 1
 * new ApplicationError('COD001: Ocorreu um erro', customErrObj)
 *
 * // constructor 2
 * new ApplicationError({
 *   code: 'COD001',
 *   message: 'Ocorreu um erro',
 *   details: customErrObj
 * })
 */

/**
  * Metodo para converter o Erro em objeto literal
  */
Error.prototype.toObject = function () {
  return ApplicationError.toObject(this)
}

export default class ApplicationError extends Error {
  /**
   * ApplicationError.assert()
   * 
   * Wrapper para a lib assert do Node.
   * Cria um objeto dinamicamente copiando todos os metodos da lib assert instanciando a classe ApplicationError como erro da assertation
   * 
   * Exemplo:
   * ApplicationError.assert.ok()
   * ApplicationError.assert.equal()
   * ApplicationError.assert.fail()
   * 
   */
  static get assert () {
    const ErrorClass = this
    // encapsular o metodo assert() para usar a instancia da classe ApplicationError invés de classe nativa AssertionError
    const assertation = (test, message) => {
      assert(test, new ErrorClass({
        message,
        // copiar o valor static family para a nova instancia
        family: this.family
      }))
    }

    // criar warppers dinamicos para cada metodo da lib assert passando convertendo a string de messagem em uma instancia da classe de erro
    for (const key in assert) {
      if (Object.prototype.hasOwnProperty.call(assert, key)) {
        const fn = assert[key]
        // obter a mensagem padrao
        const { message } = new assert.AssertionError({
          operator: key
        })

        Object.assign(assertation, {
          [key]: (...args) => {
            // remover o ultimo parametro que na maioria dos metodos sao o message
            // assert.ok(value[, message])
            const myMessage = args.pop()
            // se o ultimo parametro nao for uma string usar a mensagem padrao do metodo de assertation
            if (typeof myMessage === 'string') {
              fn.apply(assert, args, new ErrorClass(myMessage))
            } else {
              // usar mensagem padrao
              fn.apply(assert, args, new ErrorClass(message))
            }
          }
        })

        // ---->  casos especiais -------------------

        // assert.fail(actual, expected[, message[, operator[, stackStartFn]]])
        Object.assign(assertation, {
          fail: (actual, expected, myMessage, operator, stackStartFn) => {
            if (typeof myMessage === 'string') {
              fn.apply(assert, actual, expected, new ErrorClass(myMessage), operator, stackStartFn)
            } else {
              // usar mensagem padrao
              fn.apply(assert, actual, expected, new ErrorClass(message), operator, stackStartFn)
            }
          }
        })
      }
    }

    // ---->  inteface customizada -------------------

    Object.assign(assertation, {
      /**
       * Testa se um valor tem é de um tipo primitivo especifico
       * Ex: assert.type('uma string', String) -> se o valor passado nao for uma string um erro será lançado
       */
      type: (value, Type, myMessage) => {
        let type = String(Type)
        if (typeof Type === 'function') {
          type = Type.name.toLowerCase()
        }

        if (type === 'array') {
          if (!Array.isArray(value)) {
            assert.fail(new ErrorClass(myMessage || 'Asseration Failed'))
          }
          return
        }

        if (typeof value !== type) {
          assert.fail(new ErrorClass(myMessage || 'Asseration Failed'))
        }
      },
      array: (value, myMessage) => {
        assertation.type(value, Array, myMessage)
      },
      string: (value, myMessage) => {
        assertation.type(value, String, myMessage)
      },
      number: (value, myMessage) => {
        assertation.type(value, Number, myMessage)
      },
      boolean: (value, myMessage) => {
        assertation.type(value, Boolean, myMessage)
      },
      function: (value, myMessage) => {
        assertation.type(value, Function, myMessage)
      },
      object: (value, myMessage) => {
        if (value === null) {
          assert.fail(new ErrorClass(myMessage || 'Asseration Failed'))
        }
        assertation.type(value, Object, myMessage)
      },
      notEmpty: (value, myMessage) => {
        if (value === null) {
          assert.fail(new ErrorClass(myMessage || 'Null value'))
        }
        switch (typeof value) {
          case 'string':
            assert.notEqual(value, '', new ErrorClass(myMessage || 'Empty string'))
            break
          case 'array':
            assert.notEqual(value.length, 0, new ErrorClass(myMessage || 'Array is empty'))
            break
          case 'boolean':
            this.boolean(value, myMessage)
            break
          case 'number':
            this.number(value, myMessage)
            break
          case 'function':
            this.function(value, myMessage)
            break
          default:
            assert(value, new ErrorClass(myMessage || 'Assertation error for not empty value'))
        }
      }
    })

    return assertation
  }

  constructor () {
    const [properties, details] = arguments
    let [message, code] = arguments

    if (typeof message === 'string') {
      super(message)
    } else if (properties.message) {
      const { message } = properties
      super(message)
    } else {
      super('unknown error')
    }

    // pode ser passado pela classe que herdar
    if (typeof this.type === 'undefined') {
      this.type = ErrorTypes.RUNTIME
    }

    if (typeof this.family !== 'string') {
      this.family = ''
    }

    if (typeof details === 'object') {
      this.details = details
    }

    // details foi passado como segundo parametro
    if (typeof code !== 'string') {
      code = null
    }

    // Saving class name in the property of our custom error as a shortcut.
    // this.name = this.constructor.name

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor)

    // se o primeiro parametro for um objeto importar para a instancia
    // {code: 1, message: 'Ocorreu um erro' ...}
    if (typeof properties === 'object') {
      const { name, stack, message } = properties

      // copiar todos as propriedades do Error ou JSON para a instancia
      Object.assign(this, properties)

      if (name) {
        this.name = name
        this.errorClass = name
      }

      if (message) {
        this.message = message
      }

      if (stack) {
        this.stack = String(stack)
      }
    }

    // convert "COD001: Meu erro" para {code: 'FAMILY#MOD.COD001', message: 'Meu erro', family: 'FAMILY'}
    Object.assign(this, this.stripCodeFromDescription(this.message, this.code || code))

    if (!this.code) {
      this.code = 'UKW'
    }

    if (!this.message) {
      this.message = 'unknown error from server'
    }

    if (!this.time) {
      this.time = new Date()
    }

    // configurar o erro.isThrowable atributo dinamico
    const self = this
    Object.defineProperty(this, 'isThrowable', {
      get: function () { return self.type < ErrorTypes.THROWABLE },
      // writable: false,
      configurable: false
    })
  }

  /**
   * setCode - Atribui um codigo com a familia do erro
   * family: 'ERR'
   * code: 001
   * @memberof module:lib/errors.ApplicationError
   * @instance
   * @param {string} code Description
   * @instance
   * @example
   * setCode(001) -> 'ERR001'
   */
  setCode (code) {
    this._code = code
    this.code = this.family + code
  }

  setType (type) {
    this.type = type
  }

  /**
   * setFamily - Profixo do erro
   * @memberof module:lib/errors.ApplicationError
   * @instance
   * @instance
   * @param {string} family
   */
  setFamily (family) {
    this.family = family
    this.setCode(this._code || this.code)
  }

  /**
   * toJSON - retorna um objeto representando a instancia do erro durante
   * serializacao para JSON
   * @memberof module:lib/errors.ApplicationError
   * @instance
   * @instance
   * @returns {object}
   */
  toJSON () {
    const error = Object.assign({},
      ApplicationError.toObject(this), this, {
        details: ApplicationError.toObject(this.details)
      })
    return JSON.stringify(error)
  }

  /**
   * toString - formata o erro para string
   * @memberof module:lib/errors.ApplicationError
   * @instance
   * @returns {string}
   */
  toString () {
    const p = []
    p.push(`${this.errorClass || this.constructor.name}:`)
    if (this.code) {
      p.push(`[${this.code}]`)
    }
    p.push(this.message)
    return p.join(' ')
  }

  /**
   * throw - Levantar erro automaticamente
   * @memberof module:lib/errors.ApplicationError
   * @instance
   * Promise.catch(err.throw)
   * @instance
   */
  throw () {
    if (this.isThrowable) {
      const self = this
      throw self
    }
  }

  /**
   * stripCodeFromDescription - Convert "COD001: Meu erro" para {code: 'COD001', message: 'Meu erro'}
   * @memberof module:lib/errors.ApplicationError
   * @instance
   * @param {string}   description Description
   * @param {string} [code=]     Description
   * @returns {object}
   */
  stripCodeFromDescription (description, code = '') {
    let strip = { code: code || '', message: String(description) }
    const regex = /^(?:(\w+\.\w+)\/)?(?:(\w+)#)?([\w\.]+):(.*)$/
    const match = description.match(regex)

    if (match) {
      const [_, uri, family, code, message] = match
      return { uri, family, code, message: String(message).trim() }
    }

    return strip
  }

  /**
   * toObject - convert um Error nativo para objeto
   * Se passar um objeto diferente de uma instancia de Error retorna ele mesmo
   * @memberof module:lib/errors.ApplicationError
   * @param {Error} err
   * @static
   * @returns {object}
   */
  static toObject (err) {
    if (err instanceof Error) {
      const json = Object.assign({}, err, {
        name: err.errorClass || err.constructor.name,
        message: err.message,
        stack: String(err.stack)
      })
      for (const key in json) {
        if (Object.prototype.isPrototypeOf.call(json, key)) {
          const value = json[key]
          json[key] = this.toObject(value)
        }
      }
      // if (err.details) {
      //   err.details = this.toObject(err.details)
      // }
      return json
    }
    return err
  }

  /**
   * @memberof module:lib/errors.ApplicationError
   * @param {Object} error
   * @return {Promise<Object>}
   */
  static wrapper (error) {
    if (error.type === ErrorTypes.PROC_CANCELED) {
      return Promise.resolve(null)
    }

    if (error instanceof ApplicationError) {
      throw error
    }

    const errorWraped = new ApplicationError(error)

    errorWraped.setFamily('unknown')
    errorWraped.details = error
    throw errorWraped
  }

  /**
   * @memberof module:lib/errors.ApplicationError
   * @return {Error<ApplicationError>}
   */
  static cancelProc () {
    const error = new ApplicationError('')
    error.type = ErrorTypes.PROC_CANCELED
    throw error
  }

  /**
   * Converter um Error do Autobahn para ApplicationError
   * @memberof module:lib/errors.ApplicationError
   * @return {Error<ApplicationError>}
   * @param err Object
   */
  static parse (error) {
    if (error instanceof ApplicationError) {
      return error
    }
    // tipo de erro do Autobahn
    if (error.error && Array.isArray(error.args)) {
      const [err] = error.args
      let parsedJsonError
      try {
        // quando o erro está encadeado
        parsedJsonError = JSON.parse(err)
        return new ApplicationError(parsedJsonError)
      } catch (ex) {

      }
      if (typeof err === 'string') {
        return new this({
          type: ErrorTypes.CONNECTION,
          code: error.error,
          family: 'wamp',
          message: err,
          details: error
        })
      }
      return new this(err, error)
    }
    return new this(error)
  }
}

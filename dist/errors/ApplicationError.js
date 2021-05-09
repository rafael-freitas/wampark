"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _wrapNativeSuper2 = _interopRequireDefault(require("@babel/runtime/helpers/wrapNativeSuper"));

var _ErrorTypes = _interopRequireDefault(require("./ErrorTypes"));

var _assert = _interopRequireDefault(require("assert"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

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
  return ApplicationError.toObject(this);
};

var ApplicationError = /*#__PURE__*/function (_Error) {
  (0, _inherits2["default"])(ApplicationError, _Error);

  var _super = _createSuper(ApplicationError);

  (0, _createClass2["default"])(ApplicationError, null, [{
    key: "assert",

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
    get: function get() {
      var _this2 = this;

      var ErrorClass = this; // encapsular o metodo assert() para usar a instancia da classe ApplicationError invés de classe nativa AssertionError

      var assertation = function assertation(test, message) {
        (0, _assert["default"])(test, new ErrorClass({
          message: message,
          // copiar o valor static family para a nova instancia
          family: _this2.family
        }));
      }; // criar warppers dinamicos para cada metodo da lib assert passando convertendo a string de messagem em uma instancia da classe de erro


      for (var key in _assert["default"]) {
        if (Object.prototype.hasOwnProperty.call(_assert["default"], key)) {
          (function () {
            var fn = _assert["default"][key]; // obter a mensagem padrao

            var _assert$AssertionErro = new _assert["default"].AssertionError({
              operator: key
            }),
                message = _assert$AssertionErro.message;

            Object.assign(assertation, (0, _defineProperty2["default"])({}, key, function () {
              for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
              }

              // remover o ultimo parametro que na maioria dos metodos sao o message
              // assert.ok(value[, message])
              var myMessage = args.pop(); // se o ultimo parametro nao for uma string usar a mensagem padrao do metodo de assertation

              if (typeof myMessage === 'string') {
                fn.apply(_assert["default"], args, new ErrorClass(myMessage));
              } else {
                // usar mensagem padrao
                fn.apply(_assert["default"], args, new ErrorClass(message));
              }
            })); // ---->  casos especiais -------------------
            // assert.fail(actual, expected[, message[, operator[, stackStartFn]]])

            Object.assign(assertation, {
              fail: function fail(actual, expected, myMessage, operator, stackStartFn) {
                if (typeof myMessage === 'string') {
                  fn.apply(_assert["default"], actual, expected, new ErrorClass(myMessage), operator, stackStartFn);
                } else {
                  // usar mensagem padrao
                  fn.apply(_assert["default"], actual, expected, new ErrorClass(message), operator, stackStartFn);
                }
              }
            });
          })();
        }
      } // ---->  inteface customizada -------------------


      Object.assign(assertation, {
        /**
         * Testa se um valor tem é de um tipo primitivo especifico
         * Ex: assert.type('uma string', String) -> se o valor passado nao for uma string um erro será lançado
         */
        type: function type(value, Type, myMessage) {
          var type = String(Type);

          if (typeof Type === 'function') {
            type = Type.name.toLowerCase();
          }

          if ((0, _typeof2["default"])(value) !== type) {
            _assert["default"].fail(new ErrorClass(myMessage || 'Asseration Failed'));
          }
        },
        array: function array(value, myMessage) {
          _this2.type(value, Array, myMessage);
        },
        string: function string(value, myMessage) {
          _this2.type(value, String, myMessage);
        },
        number: function number(value, myMessage) {
          _this2.type(value, Number, myMessage);
        },
        "boolean": function boolean(value, myMessage) {
          _this2.type(value, Boolean, myMessage);
        },
        "function": function _function(value, myMessage) {
          _this2.type(value, Function, myMessage);
        },
        object: function object(value, myMessage) {
          if (value === null) {
            _assert["default"].fail(new ErrorClass(myMessage || 'Asseration Failed'));
          }

          _this2.type(value, Object, myMessage);
        },
        notEmpty: function notEmpty(value, myMessage) {
          if (value === null) {
            _assert["default"].fail(new ErrorClass(myMessage || 'Null value'));
          }

          switch ((0, _typeof2["default"])(value)) {
            case 'string':
              _assert["default"].notEqual(value, '', new ErrorClass(myMessage || 'Empty string'));

              break;

            case 'array':
              _assert["default"].notEqual(value.length, 0, new ErrorClass(myMessage || 'Array is empty'));

              break;

            case 'boolean':
              _this2["boolean"](value, myMessage);

              break;

            case 'number':
              _this2.number(value, myMessage);

              break;

            case 'function':
              _this2["function"](value, myMessage);

              break;

            default:
              (0, _assert["default"])(value, new ErrorClass(myMessage || 'Assertation error for not empty value'));
          }
        }
      });
      return assertation;
    }
  }]);

  function ApplicationError() {
    var _this;

    (0, _classCallCheck2["default"])(this, ApplicationError);

    var _arguments = Array.prototype.slice.call(arguments),
        properties = _arguments[0],
        details = _arguments[1];

    var _arguments2 = Array.prototype.slice.call(arguments),
        message = _arguments2[0],
        code = _arguments2[1];

    if (typeof message === 'string') {
      _this = _super.call(this, message);
    } else if (properties.message) {
      var _message = properties.message;
      _this = _super.call(this, _message);
    } else {
      _this = _super.call(this, 'unknown error');
    } // pode ser passado pela classe que herdar


    if (typeof _this.type === 'undefined') {
      _this.type = _ErrorTypes["default"].RUNTIME;
    }

    if (typeof _this.family !== 'string') {
      _this.family = '';
    }

    if ((0, _typeof2["default"])(details) === 'object') {
      _this.details = details;
    } // details foi passado como segundo parametro


    if (typeof code !== 'string') {
      code = null;
    } // Saving class name in the property of our custom error as a shortcut.
    // this.name = this.constructor.name
    // Capturing stack trace, excluding constructor call from it.


    Error.captureStackTrace((0, _assertThisInitialized2["default"])(_this), _this.constructor); // se o primeiro parametro for um objeto importar para a instancia
    // {code: 1, message: 'Ocorreu um erro' ...}

    if ((0, _typeof2["default"])(properties) === 'object') {
      var name = properties.name,
          stack = properties.stack,
          _message2 = properties.message; // copiar todos as propriedades do Error ou JSON para a instancia

      Object.assign((0, _assertThisInitialized2["default"])(_this), properties);

      if (name) {
        _this.name = name;
        _this.errorClass = name;
      }

      if (_message2) {
        _this.message = _message2;
      }

      if (stack) {
        _this.stack = String(stack);
      }
    } // convert "COD001: Meu erro" para {code: 'COD001', message: 'Meu erro'}


    Object.assign((0, _assertThisInitialized2["default"])(_this), _this.stripCodeFromDescription(_this.message, _this.code || code));

    if (!_this.code) {
      _this.code = 'UKW';
    }

    if (!_this.message) {
      _this.message = 'unknown error from server';
    }

    if (!_this.time) {
      _this.time = new Date();
    } // configurar o erro.isThrowable atributo dinamico


    var self = (0, _assertThisInitialized2["default"])(_this);
    Object.defineProperty((0, _assertThisInitialized2["default"])(_this), 'isThrowable', {
      get: function get() {
        return self.type < _ErrorTypes["default"].THROWABLE;
      },
      // writable: false,
      configurable: false
    });
    return (0, _possibleConstructorReturn2["default"])(_this);
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


  (0, _createClass2["default"])(ApplicationError, [{
    key: "setCode",
    value: function setCode(code) {
      this._code = code;
      this.code = this.family + code;
    }
  }, {
    key: "setType",
    value: function setType(type) {
      this.type = type;
    }
    /**
     * setFamily - Profixo do erro
     * @memberof module:lib/errors.ApplicationError
     * @instance
     * @instance
     * @param {string} family
     */

  }, {
    key: "setFamily",
    value: function setFamily(family) {
      this.family = family;
      this.setCode(this._code || this.code);
    }
    /**
     * toJSON - retorna um objeto representando a instancia do erro durante
     * serializacao para JSON
     * @memberof module:lib/errors.ApplicationError
     * @instance
     * @instance
     * @returns {object}
     */

  }, {
    key: "toJSON",
    value: function toJSON() {
      var error = Object.assign({}, ApplicationError.toObject(this), this, {
        details: ApplicationError.toObject(this.details)
      });
      return JSON.stringify(error);
    }
    /**
     * toString - formata o erro para string
     * @memberof module:lib/errors.ApplicationError
     * @instance
     * @returns {string}
     */

  }, {
    key: "toString",
    value: function toString() {
      var p = [];
      p.push("".concat(this.errorClass || this.constructor.name, ":"));

      if (this.code) {
        p.push("[".concat(this.code, "]"));
      }

      p.push(this.message);
      return p.join(' ');
    }
    /**
     * throw - Levantar erro automaticamente
     * @memberof module:lib/errors.ApplicationError
     * @instance
     * Promise.catch(err.throw)
     * @instance
     */

  }, {
    key: "throw",
    value: function _throw() {
      if (this.isThrowable) {
        var self = this;
        throw self;
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

  }, {
    key: "stripCodeFromDescription",
    value: function stripCodeFromDescription(description) {
      var code = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var strip = {
        code: code || '',
        message: String(description)
      };

      if (/^[\w]+:/.test(String(description))) {
        strip = String(description).split(':');
        return {
          code: strip.shift(),
          message: strip.join(':').trim()
        };
      }

      return strip;
    }
    /**
     * toObject - convert um Error nativo para objeto
     * Se passar um objeto diferente de uma instancia de Error retorna ele mesmo
     * @memberof module:lib/errors.ApplicationError
     * @param {Error} err
     * @static
     * @returns {object}
     */

  }], [{
    key: "toObject",
    value: function toObject(err) {
      if (err instanceof Error) {
        var json = Object.assign({}, err, {
          name: err.errorClass || err.constructor.name,
          message: err.message,
          stack: String(err.stack)
        });

        for (var key in json) {
          if (Object.prototype.isPrototypeOf.call(json, key)) {
            var value = json[key];
            json[key] = this.toObject(value);
          }
        } // if (err.details) {
        //   err.details = this.toObject(err.details)
        // }


        return json;
      }

      return err;
    }
    /**
     * @memberof module:lib/errors.ApplicationError
     * @param {Object} error
     * @return {Promise<Object>}
     */

  }, {
    key: "wrapper",
    value: function wrapper(error) {
      if (error.type === _ErrorTypes["default"].PROC_CANCELED) {
        return Promise.resolve(null);
      }

      if (error instanceof ApplicationError) {
        throw error;
      }

      var errorWraped = new ApplicationError(error);
      errorWraped.setFamily('unknown');
      errorWraped.details = error;
      throw errorWraped;
    }
    /**
     * @memberof module:lib/errors.ApplicationError
     * @return {Error<ApplicationError>}
     */

  }, {
    key: "cancelProc",
    value: function cancelProc() {
      var error = new ApplicationError('');
      error.type = _ErrorTypes["default"].PROC_CANCELED;
      throw error;
    }
    /**
     * Converter um Error do Autobahn para ApplicationError
     * @memberof module:lib/errors.ApplicationError
     * @return {Error<ApplicationError>}
     * @param err Object
     */

  }, {
    key: "parse",
    value: function parse(error) {
      if (error instanceof ApplicationError) {
        return error;
      } // tipo de erro do Autobahn


      if (error.error && Array.isArray(error.args)) {
        var _error$args = (0, _slicedToArray2["default"])(error.args, 1),
            err = _error$args[0];

        var parsedJsonError;

        try {
          // quando o erro está encadeado
          parsedJsonError = JSON.parse(err);
          return new ApplicationError(parsedJsonError);
        } catch (ex) {}

        return new this(err);
      }

      return new this(error);
    }
  }]);
  return ApplicationError;
}( /*#__PURE__*/(0, _wrapNativeSuper2["default"])(Error));

exports["default"] = ApplicationError;
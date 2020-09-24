"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _ErrorTypes = _interopRequireDefault(require("./ErrorTypes"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

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
  _inherits(ApplicationError, _Error);

  var _super = _createSuper(ApplicationError);

  _createClass(ApplicationError, null, [{
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

            Object.assign(assertation, _defineProperty({}, key, function () {
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

          if (_typeof(value) !== type) {
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

          switch (_typeof(value)) {
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

    _classCallCheck(this, ApplicationError);

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

    if (_typeof(details) === 'object') {
      _this.details = details;
    } // details foi passado como segundo parametro


    if (typeof code !== 'string') {
      code = null;
    } // Saving class name in the property of our custom error as a shortcut.
    // this.name = this.constructor.name
    // Capturing stack trace, excluding constructor call from it.


    Error.captureStackTrace(_assertThisInitialized(_this), _this.constructor); // se o primeiro parametro for um objeto importar para a instancia
    // {code: 1, message: 'Ocorreu um erro' ...}

    if (_typeof(properties) === 'object') {
      var name = properties.name,
          stack = properties.stack,
          _message2 = properties.message; // copiar todos as propriedades do Error ou JSON para a instancia

      Object.assign(_assertThisInitialized(_this), properties);

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


    Object.assign(_assertThisInitialized(_this), _this.stripCodeFromDescription(_this.message, _this.code || code));

    if (!_this.code) {
      _this.code = 'UKW';
    }

    if (!_this.message) {
      _this.message = 'unknown error from server';
    }

    if (!_this.time) {
      _this.time = new Date();
    } // configurar o erro.isThrowable atributo dinamico


    var self = _assertThisInitialized(_this);

    Object.defineProperty(_assertThisInitialized(_this), 'isThrowable', {
      get: function get() {
        return self.type < _ErrorTypes["default"].THROWABLE;
      },
      // writable: false,
      configurable: false
    });
    return _possibleConstructorReturn(_this);
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


  _createClass(ApplicationError, [{
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
        var _error$args = _slicedToArray(error.args, 1),
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
}( /*#__PURE__*/_wrapNativeSuper(Error));

exports["default"] = ApplicationError;
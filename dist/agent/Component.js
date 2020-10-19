"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _AgentError = _interopRequireDefault(require("./AgentError"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
var Component = /*#__PURE__*/function () {
  function Component(proc, properties) {
    _classCallCheck(this, Component);

    this.$proc = proc;
    this.$props = properties; // this.$session = session
  }

  _createClass(Component, [{
    key: "plugin",
    value: function plugin(name, args) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      options = Object.assign(options, this.$props, args); // const { _cid, _uid, _elid, pid } = options

      return this.$proc.transport(_objectSpread(_objectSpread({}, options), {}, {
        plugin: name
      }));
    }
  }, {
    key: "method",
    value: function method(_method) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return this.plugin('execComponentMethod', {
        method: _method,
        args: args
      });
    }
  }, {
    key: "addTab",
    value: function addTab(options) {
      return this.plugin('execComponentMethod', {
        method: 'addTab',
        args: [options]
      });
    }
  }, {
    key: "redirect",
    value: function redirect(url) {
      return this.plugin('redirect', {
        url: url
      }, {
        _elid: 'app'
      });
    }
  }, {
    key: "message",
    value: function message(options) {
      return this.plugin('message', {
        options: options
      });
    }
  }, {
    key: "notify",
    value: function notify(options) {
      var _this = this;

      var success = function success(message) {
        var title = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Sucesso!';

        var option = _objectSpread(_objectSpread({}, options), {}, {
          message: message,
          title: title,
          type: 'success'
        });

        return _this.plugin('notify', {
          options: option
        });
      };

      var error = function error(message) {
        var title = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Erro!';

        var option = _objectSpread(_objectSpread({}, options), {}, {
          message: message,
          title: title,
          type: 'error'
        });

        return _this.plugin('notify', {
          options: option
        });
      };

      var warn = function warn(message) {
        var title = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Cuidado!';

        var option = _objectSpread(_objectSpread({}, options), {}, {
          message: message,
          title: title,
          type: 'warning'
        });

        return _this.plugin('notify', {
          options: option
        });
      };

      var info = function info(message) {
        var title = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Informação';

        var option = _objectSpread(_objectSpread({}, options), {}, {
          message: message,
          title: title,
          type: 'info'
        });

        return _this.plugin('notify', {
          options: option
        });
      };

      return {
        success: success,
        error: error,
        warn: warn,
        info: info
      };
    }
  }, {
    key: "addComponent",
    value: function addComponent(options) {
      return this.plugin('addComponent', {
        options: options
      });
    }
  }, {
    key: "awaitEvent",
    value: function awaitEvent(options) {
      return this.plugin('eventListener', _objectSpread({}, options));
    }
    /**
     * Componente exibe um dialog de escolha travando o processo até que o usuário confirme ou cancele
     * o dialog.
     * @param {Object} options Propriedades de configuração do componente
     * @property {String} options.component Path para o componente que será exibido
     * @property {String} options.eventName Nome do evento que quando disparado irá dar continuidade no processo
     * @return {Process}
     */

  }, {
    key: "dangerousChoice",
    value: function () {
      var _dangerousChoice = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var options,
            defaultOptions,
            mergedOptions,
            component,
            choice,
            _args = arguments;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                options = _args.length > 0 && _args[0] !== undefined ? _args[0] : {};
                defaultOptions = {
                  component: 'shared/components/dialogs/c-confirma-remocao-dialog',
                  eventName: 'choice'
                };
                mergedOptions = Object.assign(defaultOptions, options);
                _context.next = 5;
                return this.addComponent(mergedOptions);

              case 5:
                component = _context.sent;
                _context.next = 8;
                return this.$proc.component(component).awaitEvent({
                  name: mergedOptions.eventName
                });

              case 8:
                choice = _context.sent;

                if (!choice) {
                  _AgentError["default"].cancelProc();
                }

                return _context.abrupt("return", this.$proc);

              case 11:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function dangerousChoice() {
        return _dangerousChoice.apply(this, arguments);
      }

      return dangerousChoice;
    }()
  }]);

  return Component;
}();

exports["default"] = Component;
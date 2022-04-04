"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _AgentError = _interopRequireDefault(require("./AgentError"));

var _Component = _interopRequireDefault(require("./protocol/Component"));

var _Workspace = _interopRequireDefault(require("./protocol/Workspace"));

var _Dock = _interopRequireDefault(require("./protocol/Dock"));

var _Dialogs = _interopRequireDefault(require("./protocol/Dialogs"));

var _Store = _interopRequireDefault(require("./protocol/Store"));

var _WampServerInterface = _interopRequireDefault(require("./protocol/WampServerInterface"));

var _index = _interopRequireDefault(require("../index"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var ClientApplication = /*#__PURE__*/function () {
  function ClientApplication(routeProtocol) {
    (0, _classCallCheck2["default"])(this, ClientApplication);
    this.routeProtocol = routeProtocol; // metodo padrao de transporte (comunicacao com o Agent cliente)
    // usar como padrao o RPC para transportar o protocolo pro cliente
    // um call() via RPC para o Agent no cliente

    this.transport = this.rpcTransport;
    this.$server = new _WampServerInterface["default"](this.root);
  }
  /**
   * Criar uma instancia para uma session de requisição
   *
   * @param  {Object} routeProtocol endpoint.details.caller
   * @return {ClientApplication}
   */


  (0, _createClass2["default"])(ClientApplication, [{
    key: "rpcTransport",

    /**
    * Metodo de transport (comunicacao com o Agent cliente) via RPC
    *
    * @param {*} kwargs Carga de dados para processar no lado cliente pelo Agent
    *
    * @returns {Promise}
    */
    value: function rpcTransport(kwargs, routeProtocol) {
      routeProtocol = Object.assign({}, this.routeProtocol, routeProtocol);
      var _routeProtocol = routeProtocol,
          targetSession = _routeProtocol.targetSession;

      if (!targetSession) {
        return Promise.reject(new _AgentError["default"]('001: Nenhuma targetSession foi configurada'));
      }

      return _index["default"].currentSession.call("agent.".concat(targetSession), [routeProtocol], kwargs);
    }
  }, {
    key: "createPubsubTransport",
    value: function createPubsubTransport(route) {
      var _this = this;

      return function (kwargs) {
        var routeProtocol = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        return _index["default"].currentSession.publish(route, [Object.assign({}, _this.routeProtocol, routeProtocol)], kwargs, routeProtocol);
      };
    }
  }, {
    key: "plugin",
    value: function plugin(name) {
      var payload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var routeProtocol = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return this.transport({
        plugin: name,
        payload: payload
      }, routeProtocol);
    }
  }, {
    key: "broadcast",
    value: function broadcast(pubsubRouteName) {
      var app = new ClientApplication(_objectSpread({
        isBroadcast: true
      }, this.routeProtocol)); // cria uma function clousure com a chamada do publish()
      // para ser usada no metodo plugin() por exemplo
      // configurando o metodo de transporte padrao do processo

      app.transport = this.createPubsubTransport(pubsubRouteName); // depois de configurado o transporte retorna o processo para
      // uso padrao

      return app;
    }
  }, {
    key: "component",
    value: function component(selector) {
      var routeProtocol = {};

      if ((0, _typeof2["default"])(selector) === 'object') {
        Object.assign(routeProtocol, selector);
      } else {
        Object.assign(routeProtocol, {
          querySelector: selector
        });
      }

      return new _Component["default"](this, routeProtocol);
    }
  }, {
    key: "redirect",
    value: function redirect(url) {
      return this.plugin('redirect', {
        url: url,
        isRootComponent: true
      });
    }
  }, {
    key: "message",
    value: function message(options) {
      return this.plugin('message', {
        options: options
      }, {
        isRootComponent: true
      });
    }
    /**
     * Adiciona um component no App.vue
     * Retorna uma instancia de Component do componente adicionado
     * @param  {String}  filepath Caminho do arquivo no cliente: p/a/t/h/arquivo.vue
     * @return {Component}
     */

  }, {
    key: "addComponent",
    value: function () {
      var _addComponent = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(filepath) {
        var ref;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.plugin('addComponent', {
                  component: filepath
                }, {
                  isRootComponent: true
                });

              case 2:
                ref = _context.sent;
                return _context.abrupt("return", this.component(ref));

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function addComponent(_x) {
        return _addComponent.apply(this, arguments);
      }

      return addComponent;
    }()
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {};
    }
  }, {
    key: "dialogs",
    get: function get() {
      return new _Dialogs["default"](this);
    }
  }, {
    key: "workspace",
    get: function get() {
      return new _Workspace["default"](this);
    }
  }, {
    key: "dock",
    get: function get() {
      return new _Dock["default"](this);
    }
  }, {
    key: "store",
    get: function get() {
      return new _Store["default"](this);
    }
  }, {
    key: "root",
    get: function get() {
      return this.component({
        isRootComponent: true
      });
    }
  }, {
    key: "notify",
    get: function get() {
      var _this2 = this;

      var sendNotify = function sendNotify(options) {
        return _this2.plugin('notify', {
          options: options
        }, {
          isRootComponent: true
        });
      };

      Object.assign(sendNotify, {
        success: function success(message) {
          var title = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Sucesso!';
          return sendNotify({
            message: message,
            title: title,
            type: 'success'
          });
        },
        info: function info(message) {
          var title = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Informação!';
          return sendNotify({
            message: message,
            title: title,
            type: 'info'
          });
        },
        error: function error(message) {
          var title = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Erro!';
          return sendNotify({
            message: message,
            title: title,
            type: 'error'
          });
        },
        warning: function warning(message) {
          var title = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Atenção!';
          return sendNotify({
            message: message,
            title: title,
            type: 'warning'
          });
        }
      });
      return sendNotify;
    }
  }, {
    key: "currentComponent",
    get: function get() {
      // codigo do component Vue na interface
      var _this$routeProtocol = this.routeProtocol,
          _uid = _this$routeProtocol._uid,
          _this$routeProtocol$i = _this$routeProtocol.isRootComponent,
          isRootComponent = _this$routeProtocol$i === void 0 ? false : _this$routeProtocol$i; // se nao foi executado a partir de algum componente usar o componente root do app
      // isso acontece quando se executa uma $action()
      // TODO verificar pq a $action nao esta passando o componente atual na requisicao

      if (!_uid) {
        isRootComponent = true;
      }

      return new _Component["default"](this, {
        _uid: _uid,
        isRootComponent: isRootComponent
      });
    }
  }], [{
    key: "create",
    value: function create(routeProtocol) {
      return new this(routeProtocol);
    }
  }]);
  return ClientApplication;
}();

exports["default"] = ClientApplication;
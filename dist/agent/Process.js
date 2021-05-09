"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _lodash = require("lodash");

var _crypto = require("crypto");

var _AgentError = _interopRequireDefault(require("./AgentError"));

var _Component = _interopRequireDefault(require("./Component"));

var _Store = _interopRequireDefault(require("./Store"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var stateHashAlgo = 'md5';

function md5(data) {
  return (0, _crypto.createHash)(stateHashAlgo).update(data).digest('hex');
}

var _defaults = {
  _uri: '',
  _context: {},
  _pid: 0,
  _cid: '',
  _targetSession: '',
  _user: '',
  _targetUser: '',
  _autoAssignSession: false,
  _broadcastSessions: '',
  // sessions do usuario
  _states: []
};

var Process = /*#__PURE__*/function () {
  function Process(properties, agent) {
    (0, _classCallCheck2["default"])(this, Process);
    this.states = [];
    this.$agent = agent;
    this.$props = (0, _lodash.defaults)(properties, _defaults);
    this.currentState = {}; // this.$props._states.push(this.currentState)

    this.callsCounter = 0;
    this.payload = this.$props.payload || {};
    this._pid = this.$props._pid; // metodo padrao de transporte (comunicacao com o Agent cliente)
    // usar como padrao o RPC para transportar o protocolo pro cliente
    // um call() via RPC para o Agent no cliente

    this.transport = this.transportRPC;
  }
  /**
  * Metodo de transport (comunicacao com o Agent cliente) via RPC
  *
  * @param {*} payload Carga de dados para processar no lado cliente pelo Agent
  *
  * @returns {Promise}
  */


  (0, _createClass2["default"])(Process, [{
    key: "transportRPC",
    value: function transportRPC(payload) {
      var _targetSession = payload._targetSession;

      if (!_targetSession) {
        return Promise.reject(new _AgentError["default"]('CPa01: Nenhuma targetSession foi configurada'));
      }

      this.callsCounter++; // cria um id para a atividade

      var stateId = md5(JSON.stringify(payload) + this.callsCounter);

      if (this.currentState[stateId]) {
        var value = this.currentState[stateId].value;

        if (typeof value !== 'undefined') {
          return Promise.resolve(value);
        }
      }

      var state = {
        payload: payload
      };
      this.currentState[stateId] = state;
      return this.$agent.$session.call("agent.".concat(_targetSession), [], payload).then(function (value) {
        state.value = value;
        return value;
      });
    }
  }, {
    key: "createPubsubTransport",
    value: function createPubsubTransport(route) {
      var _this = this;

      return function (payload) {
        return _this.$agent.$session.publish(route, [], payload);
      };
    }
    /**
    * session - Description
    *
    * @param {type} sessionid Description
    *
    * @returns {type} Description
    */

  }, {
    key: "session",
    value: function session(sessionid) {
      this.targetSession = sessionid;
      return this;
    }
  }, {
    key: "component",
    value: function component() {
      var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      if ((0, _typeof2["default"])(selector) === 'object') {
        var _cid = selector._cid;

        if (_cid) {
          return new _Component["default"](this, _objectSpread(_objectSpread(_objectSpread({}, this.$props), {}, {
            _isRootComponent: false
          }, selector), {}, {
            _useCid: true
          }));
        }
      }

      if (selector) {
        return new _Component["default"](this, _objectSpread(_objectSpread({}, this.$props), {}, {
          _isRootComponent: false,
          _elid: selector,
          _useElid: true
        }));
      }

      return new _Component["default"](this, _objectSpread({}, this.$props));
    }
  }, {
    key: "workspace",
    value: function workspace() {
      return new _Component["default"](this, _objectSpread(_objectSpread({}, this.$props), {}, {
        _elid: 'workspace',
        _useElid: true
      }));
    }
  }, {
    key: "app",
    value: function app() {
      return new _Component["default"](this, _objectSpread(_objectSpread({}, this.$props), {}, {
        _elid: 'app',
        _isRootComponent: true
      }));
    }
  }, {
    key: "store",
    value: function store() {
      return new _Store["default"](this, _objectSpread(_objectSpread({}, this.$props), {}, {
        _isStore: true
      }));
    }
  }, {
    key: "broadcast",
    value: function broadcast(pubsubRouteName) {
      var proc = new Process(_objectSpread(_objectSpread({}, this.$props), {}, {
        _isBroadcast: true
      }), this.$agent); // cria uma function clousure com a chamada do publish()
      // para ser usada no metodo plugin() por exemplo
      // configurando o metodo de transporte padrao do processo

      proc.transport = this.createPubsubTransport(pubsubRouteName); // depois de configurado o transporte retorna o processo para
      // uso padrao

      return proc;
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return {};
    }
  }]);
  return Process;
}();

exports["default"] = Process;
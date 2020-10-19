"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _events = require("events");

var _errors = _interopRequireDefault(require("./errors"));

var _logger = _interopRequireDefault(require("./logger"));

var _wampAdapter = require("./wamp-adapter");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

/**
 * @requires events
 * @description
 * Classe singleton que extende de EventEmitter (nativo) é o ponto de partida da sua aplicação.
 * Singleton Class that extends EventEmitter for support your application events based
 * @author Rafael Freitas
 * @date Set 23 2020
 */
var Application = /*#__PURE__*/function (_EventEmitter) {
  _inherits(Application, _EventEmitter);

  var _super = _createSuper(Application);

  function Application() {
    var _this;

    var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Application);

    _this = _super.call(this); // all configuration values

    _this.config = {}; // default log for application

    _this.log = (0, _logger["default"])('application');

    _this.setMaxListeners(1000 * 10); // attach logger and others values as Application instance properties


    Object.assign(_assertThisInitialized(_this), {
      logger: _logger["default"]
    }, properties); // attach Errors interface as Application instance properties

    Object.assign(_assertThisInitialized(_this), _errors["default"]); // Store clusters works

    _this.workers = []; // WAMP connection instance

    _this.wampConnection = null; // the current WAMP (crossbar/autobahn) active and connected session

    _this.currentSession = null; // Attached Route instances in your application

    _this.routes = [];
    return _this;
  }
  /**
   * Setup the Application with custom properites like config
   * @param {Object} properties 
   */


  _createClass(Application, [{
    key: "setup",
    value: function setup(properties) {
      // just apply new properties for this Application instance
      Object.assign(this, properties);
    }
    /**
     * Attach the Agent (protocol processor) RPC route for a Crossbar.io session when it's connected
     * This route is a bridge to link the client application for backend.
     */

  }, {
    key: "attachAgentRouteToSession",
    value: function attachAgentRouteToSession() {
      console.log('[INFO] Waiting a WAMP session begins to attach an Agent RPC route');
      this.on('wamp.session.start', function (session, details) {
        var agentSessionRouteName = "agent.".concat(session.id); // register an Agent RPC procedure for the current session

        session.register(agentSessionRouteName, function (args, kwargs, details) {
          console.warn("[WARN] Backend Agent is disabled for this backend session (".concat(agentSessionRouteName, ")! Try to call directly"));
        });
      });
    }
  }, {
    key: "connectWampServer",
    value: function connectWampServer() {
      var _this2 = this;

      var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      // if exist a opened session ignore. Close the active connection first
      if (this.currentSession) {
        return console.warn('[application] There is a active WAMP connection. Close it first!');
      }

      this.wampConnection = (0, _wampAdapter.connect)(Object.assign({
        url: this.config.WAMP_URL,
        realm: this.config.WAMP_REALM,
        authid: this.config.WAMP_AUTHID,
        authpass: this.config.WAMP_AUTHPASS,
        authmethods: [typeof this.config.WAMP_AUTHMETHODS === 'string' ? this.config.WAMP_AUTHMETHODS.split(',') : 'wampcra'],
        onopen: function onopen(session) {
          _this2.emit('wamp.session.start', session);

          _this2.currentSession = session;
        },
        onclose: function onclose(reason, details) {
          _this2.emit('wamp.session.close', reason, details);

          _this2.currentSession = null;
        }
      }, settings));
    }
    /**
     * Attach a route for any wamp session starts on application
     * @param {Route} route 
     * 
     * Use:
     * application.attachRoute(class MyRoute extends Route {})
     */

  }, {
    key: "attachRoute",
    value: function attachRoute(route) {
      this.on('wamp.session.start', function (session) {
        route.attach(session);
      });
    }
  }]);

  return Application;
}(_events.EventEmitter);

var _default = new Application();

exports["default"] = _default;
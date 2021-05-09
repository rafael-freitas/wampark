"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _events = require("events");

var _errors = _interopRequireDefault(require("./errors"));

var _logger = _interopRequireDefault(require("./logger"));

var _wampAdapter = require("./wamp-adapter");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

/**
 * @requires events
 * @description
 * Classe singleton que extende de EventEmitter (nativo) é o ponto de partida da sua aplicação.
 * Singleton Class that extends EventEmitter for support your application events based
 * @author Rafael Freitas
 * @date Set 23 2020
 */
var Application = /*#__PURE__*/function (_EventEmitter) {
  (0, _inherits2["default"])(Application, _EventEmitter);

  var _super = _createSuper(Application);

  function Application() {
    var _this;

    var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck2["default"])(this, Application);
    _this = _super.call(this); // all configuration values

    _this.config = {
      /**
       * Enable cluster feature?
       */
      cluster: false
    }; // default log for application

    _this.log = (0, _logger["default"])('application');

    _this.setMaxListeners(1000 * 10); // attach logger and others values as Application instance properties


    Object.assign((0, _assertThisInitialized2["default"])(_this), {
      logger: _logger["default"]
    }, properties); // attach Errors interface as Application instance properties

    Object.assign((0, _assertThisInitialized2["default"])(_this), _errors["default"]); // Store clusters works

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


  (0, _createClass2["default"])(Application, [{
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
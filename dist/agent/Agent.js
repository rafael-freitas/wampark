"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _application = _interopRequireDefault(require("../application"));

/**
* ******************************************************************************************************
*
*   ApplicationAgent
*
*     Classe para interface de comunicação do protocolo da aplicação
*
*
*   @author     Rafael Freitas
*   @date       Apr 2 2018
*
*   @class Route
*   @memberof module:lib/agent
*
* ******************************************************************************************************
*/
// const logger = require('app/lib/logger')
var Agent = /*#__PURE__*/function () {
  function Agent() {
    (0, _classCallCheck2["default"])(this, Agent);
    this.attachWampSession();
    this.$session = null;
  }

  (0, _createClass2["default"])(Agent, [{
    key: "attachWampSession",
    value: function attachWampSession() {
      var _this = this;

      console.log('[INFO] attaching Agent to session');

      _application["default"].on('wamp.session.start', function (session, details) {
        _this.$session = session;
        var agentSessionRoute = "agent.".concat(session.id);
        session.register(agentSessionRoute, function (args, kwargs, details) {
          console.warn("[WARN] Backend Agent is disabled for this backend session (".concat(agentSessionRoute, ")! Try to call directly"));
        });
      });
    }
  }]);
  return Agent;
}();

exports["default"] = Agent;
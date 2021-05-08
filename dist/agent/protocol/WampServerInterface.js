"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var WampServerInterface = /*#__PURE__*/function () {
  function WampServerInterface(component) {
    (0, _classCallCheck2["default"])(this, WampServerInterface);
    this.component = component;
  }
  /**
   *
   * @param {String} uri Nome da rota RPC registrada no WAMP
   * @param {Object} kwargs Payload da rota
   * @param {RouteProtocol} options Configurar usuario destino ou session de destino atraves de `targetSession` e `targetUser`
   */


  (0, _createClass2["default"])(WampServerInterface, [{
    key: "call",
    value: function call(uri) {
      var kwargs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return this.component.method('$server.call', uri, kwargs, options);
    }
  }, {
    key: "subscribeBroadcast",
    value: function subscribeBroadcast(uri) {
      return this.component.method('$server.subscribeBroadcast', uri);
    }
  }]);
  return WampServerInterface;
}();

exports["default"] = WampServerInterface;
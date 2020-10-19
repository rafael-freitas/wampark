"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var WampServerInterface = /*#__PURE__*/function () {
  function WampServerInterface(component) {
    _classCallCheck(this, WampServerInterface);

    this.component = component;
  }
  /**
   *
   * @param {String} uri Nome da rota RPC registrada no WAMP
   * @param {Object} kwargs Payload da rota
   * @param {RouteProtocol} options Configurar usuario destino ou session de destino atraves de `targetSession` e `targetUser`
   */


  _createClass(WampServerInterface, [{
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
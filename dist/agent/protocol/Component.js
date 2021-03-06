"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _WampServerInterface = _interopRequireDefault(require("./WampServerInterface"));

var _errors = require("../../errors");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/**
 * Representação de componentes da UI em VueJS
 *
 *
 * @author     Rafael Freitas
 * @date       Out 06 2018
 * @module lib/agent
 */
var Component = /*#__PURE__*/function () {
  function Component(clientApplication) {
    var routeProtocol = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck2["default"])(this, Component);
    this.$clientApplication = clientApplication; // carrega as configuracoes para o Agent do client
    // ex: _querySelector do component

    this.$routeProtocol = routeProtocol;
    this.$server = new _WampServerInterface["default"](this); // redirecionar qualquer outra propriedade para method()

    return new Proxy(this, {
      get: function get(component, field) {
        if (field === 'then') {
          return component;
        }

        if (field in component) return component[field]; // normal case

        return component.method.bind(component, field);
      }
    });
  }
  /**
   * Manter compatibilidade com a serialização do retorno do endpoint da Route
   * antes de enviar para o Crossbar, evitando o Proxy()
   */


  (0, _createClass2["default"])(Component, [{
    key: "toJSON",
    value: function toJSON() {
      return _objectSpread({}, this.$routeProtocol);
    }
  }, {
    key: "$t",
    value: function $t() {
      var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      _errors.ApplicationError.assert(text, 'ER001: Configure uma string para ser traduzida');

      return this.$clientApplication.plugin('execComponentMethod', {
        method: '$t',
        args: [text]
      }, this.$routeProtocol);
    }
  }, {
    key: "method",
    value: function method(_method) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return this.$clientApplication.plugin('execComponentMethod', {
        method: _method,
        args: args
      }, this.$routeProtocol);
    }
  }, {
    key: "addComponent",
    value: function addComponent(filepath) {
      return this.$clientApplication.plugin('addComponent', {
        component: filepath
      }, this.$routeProtocol);
    }
  }, {
    key: "awaitEvent",
    value: function awaitEvent(name) {
      return this.$clientApplication.plugin('eventListener', {
        name: name
      }, this.$routeProtocol);
    }
  }, {
    key: "setData",
    value: function setData(path, value) {
      return this.$clientApplication.plugin('setData', {
        path: path,
        value: value
      }, this.$routeProtocol);
    }
  }, {
    key: "getData",
    value: function getData(path) {
      return this.$clientApplication.plugin('getData', {
        path: path
      }, this.$routeProtocol);
    }
    /**
     * Obter ou setar um valor de uma propriedade do componente
     * Ex: component.nome onde nome é uma propriedade de data: {} ou props: {}
     *
     * @param  {String} name nome da propriedade do componente. Ex: this.nomeCliente
     * @param  {Mixed} value Se value nao for informado será executado o getData()
     * @return {Promise}
     */

  }, {
    key: "data",
    value: function data(name, value) {
      if (typeof value !== 'undefined') {
        return this.setData(name, value);
      }

      return this.getData(name);
    }
  }]);
  return Component;
}();

exports["default"] = Component;
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _Component2 = _interopRequireDefault(require("./Component"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

/**
 * Manipulação da Store na aplicação lado cliente
 *
 *
 * @author     Rafael Freitas
 * @date       Jul 10 2018
 * @update     30 Mar 2019
 * @module lib/agent
 */
var Store = /*#__PURE__*/function (_Component) {
  (0, _inherits2["default"])(Store, _Component);

  var _super = _createSuper(Store);

  function Store() {
    var _this;

    (0, _classCallCheck2["default"])(this, Store);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.$routeProtocol.querySelector = '#app';
    _this.$routeProtocol.isRootComponent = true;
    return _this;
  }

  (0, _createClass2["default"])(Store, [{
    key: "commit",
    value: function commit(name, payload) {
      return this.$clientApplication.plugin('storeCommit', {
        commit: name,
        payload: payload
      }, this.$routeProtocol);
    }
  }]);
  return Store;
}(_Component2["default"]);

exports["default"] = Store;
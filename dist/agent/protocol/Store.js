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

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

/**
 * Manipulação da Store na aplicação lado cliente
 *
 *
 * @author     Rafael Freitas
 * @date       Jul 10 2018
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
    var _args$ = args[0],
        route = _args$ === void 0 ? {} : _args$;
    _this.$routeProtocol.isRootComponent = true;
    _this.$session = route.routeProtocol.fromSession;
    return _this;
  }

  (0, _createClass2["default"])(Store, [{
    key: "commit",
    value: function commit(name, payload) {
      var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var _config$publishAll = config.publishAll,
          publishAll = _config$publishAll === void 0 ? true : _config$publishAll;
      var options = Object.assign({}, this.$routeProtocol);

      if (!publishAll && this.$session) {
        options.eligible = [this.$session];
      }

      return this.$clientApplication.plugin('storeCommit', {
        commit: name,
        payload: payload
      }, options);
    }
  }]);
  return Store;
}(_Component2["default"]);

exports["default"] = Store;
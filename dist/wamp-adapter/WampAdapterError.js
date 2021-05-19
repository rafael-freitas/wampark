"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _errors = _interopRequireDefault(require("../errors"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var ErrorTypes = _errors["default"].ErrorTypes,
    ApplicationError = _errors["default"].ApplicationError;

var WampAdapterError = /*#__PURE__*/function (_ApplicationError) {
  (0, _inherits2["default"])(WampAdapterError, _ApplicationError);

  var _super = _createSuper(WampAdapterError);

  function WampAdapterError() {
    var _this;

    (0, _classCallCheck2["default"])(this, WampAdapterError);
    _this = _super.apply(this, arguments);

    _this.setFamily('WAMPADT');

    _this.type = ErrorTypes.CONNECTION;
    return _this;
  }

  return WampAdapterError;
}(ApplicationError);

exports["default"] = WampAdapterError;
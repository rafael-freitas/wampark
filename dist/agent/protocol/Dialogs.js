"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _Component2 = _interopRequireDefault(require("./Component"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

/**
 * Representação de componentes da UI em VueJS
 *
 *
 * @author     Rafael Freitas
 * @date       Out 06 2018
 * @module lib/agent
 */
var Dialogs = /*#__PURE__*/function (_Component) {
  (0, _inherits2["default"])(Dialogs, _Component);

  var _super = _createSuper(Dialogs);

  function Dialogs(clientApplication) {
    var routeProtocol = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck2["default"])(this, Dialogs);
    return _super.call(this, clientApplication, routeProtocol);
  }

  (0, _createClass2["default"])(Dialogs, [{
    key: "confirmRemoveDialog",
    value: function () {
      var _confirmRemoveDialog = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(options) {
        var dialog;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.$clientApplication.addComponent('shared/components/dialogs/c-confirma-remocao-dialog');

              case 2:
                dialog = _context.sent;

                if (!options) {
                  _context.next = 6;
                  break;
                }

                _context.next = 6;
                return dialog.setOptions(options);

              case 6:
                return _context.abrupt("return", dialog.awaitEvent('choice'));

              case 7:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function confirmRemoveDialog(_x) {
        return _confirmRemoveDialog.apply(this, arguments);
      }

      return confirmRemoveDialog;
    }()
  }]);
  return Dialogs;
}(_Component2["default"]);

exports["default"] = Dialogs;
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
 * @date       Apr 25 2018
 * @module lib/agent
 */
var Workspace = /*#__PURE__*/function (_Component) {
  (0, _inherits2["default"])(Workspace, _Component);

  var _super = _createSuper(Workspace);

  function Workspace() {
    var _this;

    (0, _classCallCheck2["default"])(this, Workspace);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.$routeProtocol.querySelector = '#workspace';
    return _this;
  }

  (0, _createClass2["default"])(Workspace, [{
    key: "openDrawer",
    value: function () {
      var _openDrawer = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(options) {
        var drawerOptions, _uid;

        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.$clientApplication.plugin('execComponentMethod', {
                  method: 'openDrawer',
                  args: [options]
                }, this.$routeProtocol);

              case 2:
                drawerOptions = _context.sent;
                // extrair o _uid do ComponentVue que foi renderizado dentro do Drawer
                // ele contem o metodo $_closeDrawer() que vem mixin-drawers
                _uid = drawerOptions._uid;
                return _context.abrupt("return", this.$clientApplication.component({
                  _uid: _uid
                }));

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function openDrawer(_x) {
        return _openDrawer.apply(this, arguments);
      }

      return openDrawer;
    }()
  }, {
    key: "closeDrawer",
    value: function closeDrawer() {
      return this.$clientApplication.plugin('execComponentMethod', {
        method: 'handleToggleDrawer',
        args: [false]
      }, this.$routeProtocol);
    }
  }]);
  return Workspace;
}(_Component2["default"]);

exports["default"] = Workspace;
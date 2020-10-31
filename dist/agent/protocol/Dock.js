"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _Component2 = _interopRequireDefault(require("./Component"));

var _uuid = require("uuid");

var _errors = require("../../errors");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

/**
 * Representação de componentes da UI em VueJS
 *
 *
 * @author     Rafael Freitas
 * @date       Apr 25 2018
 * @module lib/agent
 */
var Dock = /*#__PURE__*/function (_Component) {
  (0, _inherits2["default"])(Dock, _Component);

  var _super = _createSuper(Dock);

  function Dock() {
    var _this;

    (0, _classCallCheck2["default"])(this, Dock);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));
    _this.$routeProtocol.querySelector = '#dock';
    return _this;
  }

  (0, _createClass2["default"])(Dock, [{
    key: "addTab",
    value: function () {
      var _addTab = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(options) {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!options.id) {
                  options.id = uniqid();
                }

                _context.next = 3;
                return this.$clientApplication.plugin('execComponentMethod', {
                  method: 'addTab',
                  args: [options]
                }, this.$routeProtocol);

              case 3:
                options = _context.sent;
                return _context.abrupt("return", this.getTab(options));

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function addTab(_x) {
        return _addTab.apply(this, arguments);
      }

      return addTab;
    }()
  }, {
    key: "filterTabs",
    value: function filterTabs(predicate) {
      return this.$clientApplication.plugin('execComponentMethod', {
        method: 'filterTabs',
        args: [predicate]
      }, this.$routeProtocol);
    }
  }, {
    key: "activeTab",
    value: function activeTab(name) {
      return this.$clientApplication.plugin('execComponentMethod', {
        method: 'activeTab',
        args: [name]
      }, this.$routeProtocol);
    }
  }, {
    key: "closeTab",
    value: function closeTab(query) {
      return this.$clientApplication.plugin('execComponentMethod', {
        method: 'closeTab',
        args: [query]
      }, this.$routeProtocol);
    }
    /**
     * Retonar uma instancia de Component para a tab identificada por _uid codigo do component no Vue
     * @param tab options da tab
     */

  }, {
    key: "getTab",
    value: function getTab() {
      var tab = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var _uid = tab._uid;

      _errors.ApplicationError.assert(_uid, '"tab" precisa ser um objeto contendo a propriedade _uid');

      return this.$clientApplication.component({
        _uid: _uid
      });
    }
    /**
     * Garante abrir apenas uma vez a tab
     * @param  {Object}  options
     * @return {Component} Retorna o ComponentVue da Tab
     */

  }, {
    key: "pinTab",
    value: function () {
      var _pinTab = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(options) {
        var component, _options$prefix, prefix, name, tabList, _tabList, tabConfig;

        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                component = options.component, _options$prefix = options.prefix, prefix = _options$prefix === void 0 ? '' : _options$prefix; // uuid:empresa

                name = (0, _uuid.v3)(component, uuid.URL) + ':' + prefix;
                _context2.next = 4;
                return this.filterTabs({
                  name: name
                });

              case 4:
                tabList = _context2.sent;
                _tabList = (0, _slicedToArray2["default"])(tabList, 1), tabConfig = _tabList[0];

                if (!tabConfig) {
                  _context2.next = 9;
                  break;
                }

                this.activeTab(tabConfig.name);
                return _context2.abrupt("return", this.getTab(tabConfig));

              case 9:
                return _context2.abrupt("return", this.addTab(_objectSpread({
                  name: name
                }, options)));

              case 10:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function pinTab(_x2) {
        return _pinTab.apply(this, arguments);
      }

      return pinTab;
    }()
  }]);
  return Dock;
}(_Component2["default"]);

exports["default"] = Dock;

function uniqid() {
  return Math.floor((1 + Math.random()) * 0x1000000);
}
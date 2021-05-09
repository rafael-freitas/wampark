"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _express = _interopRequireDefault(require("express"));

var _lodash = require("lodash");

var _RouteTypes = _interopRequireDefault(require("./RouteTypes"));

var _Route2 = _interopRequireDefault(require("./Route"));

var _jsonerror = _interopRequireDefault(require("./middlewares/jsonerror"));

var _cluster = _interopRequireDefault(require("cluster"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

// const logger = require('app/lib/logger')
var _defaults = {
  type: _RouteTypes["default"].ALL,
  options: {},
  view: '',
  path: null,
  middleware: []
};

var WebRoute = /*#__PURE__*/function (_Route) {
  (0, _inherits2["default"])(WebRoute, _Route);

  var _super = _createSuper(WebRoute);

  function WebRoute() {
    var _this;

    var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck2["default"])(this, WebRoute);
    _this = _super.apply(this, arguments);
    properties = (0, _lodash.defaults)((0, _assertThisInitialized2["default"])(_this), _defaults, {
      router: _express["default"].Router()
    });
    Object.assign((0, _assertThisInitialized2["default"])(_this), properties);

    var _assertThisInitialize = (0, _assertThisInitialized2["default"])(_this),
        uri = _assertThisInitialize.uri;

    if ((0, _lodash.isEmpty)(uri)) {
      throw new ReferenceError('Propriedade "uri" requirido', __filename);
    }

    return _this;
  }

  (0, _createClass2["default"])(WebRoute, [{
    key: "render",
    value: function render(response) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (this.view) {
        response.vueRender(this.view, Object.assign({}, this, data));
        return;
      }

      this.json(response, data);
    }
  }, {
    key: "endpoint",

    /**
     * endpoint - Description
     *
     * @param {type} request  Description
     * @param {type} response Description
     *
     * @returns {type} Description
     */
    value: function endpoint(request, response) {}
  }], [{
    key: "attach",
    value: function attach(server) {
      var forcePath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var route = new this();
      var type = route.type,
          endpoint = route.endpoint,
          uri = route.uri,
          router = route.router,
          path = route.path; // se o type for invalido usar o metodo ALL

      if (!(0, _lodash.isFunction)(router[type])) {
        type = _RouteTypes["default"].ALL;
      }

      path = forcePath || path; // adicionar middleware padrao de tratamento de erros

      route.middleware.push(_jsonerror["default"]); // bypass no master
      // if (cluster.isMaster) {
      //   return route
      // }

      if (path !== null) {
        var method = router[type];
        method.apply(router, [uri].concat(route.middleware, [endpoint.bind(route)]));
        server.use(path, router);
      } else {
        var _method = server[type];

        _method.apply(server, [uri].concat(route.middleware, [endpoint.bind(route)]));
      }

      route.onAttachSuccess();
      route.printLogAttachSuccess();
      return route;
    }
  }]);
  return WebRoute;
}(_Route2["default"]);

exports["default"] = WebRoute;
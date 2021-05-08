"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.RouteController = exports.RouteProtocol = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _lodash = require("lodash");

var _normalize = _interopRequireDefault(require("../errors/normalize"));

var _RouteTypes = _interopRequireDefault(require("./RouteTypes"));

var _logger = _interopRequireDefault(require("../logger"));

var _ClientApplication = _interopRequireDefault(require("../agent/ClientApplication"));

var _cluster = _interopRequireDefault(require("cluster"));

var _os = _interopRequireDefault(require("os"));

var _uuid = require("uuid");

var _Application = _interopRequireDefault(require("../Application"));

/**
* ******************************************************************************************************
*
*   Route
*
*     Classe de rota para protocolo WAMP sobre Autobahn lib
*     Todas as rotas devem herdar de Route
*
*
*   @author     Rafael Freitas
*   @date       Feb 03 2018
*   @update     Apr 22 2018 by Rafael
*
*   @class Route
*   @memberof module:lib/routes
*   @requires {@link module:lib/routes.RouteTypes}
*
* ******************************************************************************************************
*/
var TOTAL_CPU_CORES = process.env.CLUSTER_MAX_FORKS || _os["default"].cpus().length;

var worker = _cluster["default"].worker;
var WORKERS_AWAIT_MAX_ATTEMPTS = 2;
var WORKERS_AWAIT_TIMEOUT = 10;
var WORKERS_TOTAL = TOTAL_CPU_CORES;
var _defaults = {
  type: _RouteTypes["default"].RPC,
  options: {}
};

var snooze = function snooze(ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
};

var RouteProtocol = function RouteProtocol(protocol) {
  (0, _classCallCheck2["default"])(this, RouteProtocol);
  Object.assign(this, {
    fromSession: null,
    targetSession: null,
    fromUser: null,
    targetUser: null
  }, protocol);
};

exports.RouteProtocol = RouteProtocol;

var RouteController = /*#__PURE__*/function () {
  function RouteController(_ref) {
    var args = _ref.args,
        kwargs = _ref.kwargs,
        details = _ref.details,
        session = _ref.session;
    (0, _classCallCheck2["default"])(this, RouteController);
    this.args = args;
    this.kwargs = kwargs;
    this.details = details;
    this.session = session;
    this.routeProtocol = new RouteProtocol(Object.assign({
      fromUser: this.details.caller_authid,
      fromSession: this.details.caller,
      targetUser: this.details.caller_authid,
      targetSession: this.details.caller
    }, this.args[0]));
  }

  (0, _createClass2["default"])(RouteController, [{
    key: "call",

    /**
     * Chamada RPC para uma rota WAMP
     * @param  {String} name rota: `route.store.appAcoes.list
     * @param  {Mixed} payload
     * @return {Promise}
     */
    value: function call(name, payload) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      return this.session.call(name, [this.routeProtocol], payload, options);
    }
    /**
     * Retorna os dados do usuario autenticado
     * @param {Boolean} returnAllUserData Se TRUE retorna os dados do usuario com seus grupos de permissoes e dados da empresa de contexto. DEFAULT TRUE
     */

  }, {
    key: "getCallerAuthId",
    value: function getCallerAuthId() {
      if (!this.details || !this.details.caller_authid) {
        return null;
      }

      return this.details.caller_authid;
    }
  }, {
    key: "clientApplication",
    get: function get() {
      return _ClientApplication["default"].create(this.routeProtocol);
    }
  }]);
  return RouteController;
}();

exports.RouteController = RouteController;

var Route = /*#__PURE__*/function () {
  function Route() {
    var properties = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck2["default"])(this, Route);
    properties = (0, _lodash.defaults)(properties, _defaults); // detalhes do caller (quem chamou a rota)

    this.details = {};
    Object.assign(this, properties);
    var uri = this.uri;

    if ((0, _lodash.isEmpty)(uri)) {
      throw new ReferenceError('property "uri" is required', __filename);
    }

    this.log = this.getLogger();
  }
  /**
   * Criar uma instancia a partir de outra Route já inicializada
   * Irá herdar os dados de sessão da rota de origem
   * @param  {Route} fromRoute Instancia de Route
   * @return {Route}
   */


  (0, _createClass2["default"])(Route, [{
    key: "getLogger",

    /**
     * @memberof module:lib/routes.Route
     * @method logger
     * @instance
     */
    value: function getLogger() {
      return (0, _logger["default"])(this.logName || this.uri || this.constructor.name);
    }
    /**
     * @memberof module:lib/routes.Route
     * @method onAttachSuccess
     * @instance
     * @param {Object} result
     * @return {Object}
     */

  }, {
    key: "onAttachSuccess",
    value: function () {
      var _onAttachSuccess = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(result) {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", result);

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function onAttachSuccess(_x) {
        return _onAttachSuccess.apply(this, arguments);
      }

      return onAttachSuccess;
    }()
    /**
     * @memberof module:lib/routes.Route
     * @method onAttachFail
     * @instance
     * @param {Object} err
     */

  }, {
    key: "onAttachFail",
    value: function onAttachFail(err) {
      return Promise.reject(err);
    }
    /**
     * @memberof module:lib/routes.Route
     * @instance
     * @param {Object} err
     * @return {Object}
     */

  }, {
    key: "printLogAttachFail",
    value: function printLogAttachFail(err) {
      var log = this.getLogger();
      log.error("Route <".concat(log.colors.silly(this.uri), "> failed: ").concat(JSON.stringify(err), " - ").concat(log.fail));
      return Promise.reject(err);
    }
    /**
     * @memberof module:lib/routes.Route
     * @method printLogAttachSuccess
     * @instance
     * @param {Object} result
     * @return {Object}
     */

  }, {
    key: "printLogAttachSuccess",
    value: function printLogAttachSuccess(result) {
      var log = this.getLogger();
      var isRegister = this.type === _RouteTypes["default"].RPC;
      var isSubscribe = this.type === _RouteTypes["default"].PUBSUB;

      if (isRegister) {
        log.info("Route RPC <".concat(log.colors.silly(this.uri), "> registered - ").concat(log.ok));
      } else if (isSubscribe) {
        log.info("Route PUBSUB <".concat(log.colors.silly(this.uri), "> subscribed - ").concat(log.ok));
      } else {
        log.info("Route HTTP <".concat(log.colors.silly(this.uri), "> attached - ").concat(log.ok));
      }

      return result;
    }
    /**
     * Register or subscribe this route into a session
     * @param session Autobahn session
     */

  }, {
    key: "setSession",
    value: function setSession(session) {
      this.session = session; // ativar cluster?

      if (_Application["default"].config.cluster) {
        if (_cluster["default"].isMaster) {
          if (this.type === _RouteTypes["default"].RPC) {
            session.register(this.uri, this.getMasterWrappedEndpoint.bind(this), this.options).then(this.onAttachSuccess.bind(this)).then(this.printLogAttachSuccess.bind(this))["catch"](this.onAttachFail.bind(this))["catch"](this.printLogAttachFail.bind(this));
          } else {
            if (this.type === _RouteTypes["default"].PUBSUB) {
              session.subscribe(this.uri, this.getMasterWrappedEndpoint.bind(this), this.options).then(this.onAttachSuccess.bind(this)).then(this.printLogAttachSuccess.bind(this))["catch"](this.onAttachFail.bind(this))["catch"](this.printLogAttachFail.bind(this));
            }
          }
        } else {
          // is a new process - a worker, so create a new channel for communication between the worker
          // and the main process to send the worker response through process.send() method
          this.registerWorker();
        }
      } else {
        if (this.type === _RouteTypes["default"].RPC) {
          session.register(this.uri, this.getWrappedEndpoint.bind(this), this.options).then(this.onAttachSuccess.bind(this)).then(this.printLogAttachSuccess.bind(this))["catch"](this.onAttachFail.bind(this))["catch"](this.printLogAttachFail.bind(this));
        } else {
          if (this.type === _RouteTypes["default"].PUBSUB) {
            session.subscribe(this.uri, this.getWrappedEndpoint.bind(this), this.options).then(this.onAttachSuccess.bind(this)).then(this.printLogAttachSuccess.bind(this))["catch"](this.onAttachFail.bind(this))["catch"](this.printLogAttachFail.bind(this));
          }
        }
      }
    }
  }, {
    key: "registerWorker",
    value: function registerWorker() {
      var _this = this;

      var endpoint = this.getWrappedEndpoint.bind(this);

      var onMessage = /*#__PURE__*/function () {
        var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
          var message,
              type,
              id,
              args,
              result,
              _args2 = arguments;
          return _regenerator["default"].wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  message = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : {};
                  type = message.type, id = message.id, args = message.args;

                  if (!(type === "route:".concat(_this.uri))) {
                    _context2.next = 13;
                    break;
                  }

                  _context2.prev = 3;
                  _context2.next = 6;
                  return endpoint.call.apply(endpoint, [_this].concat((0, _toConsumableArray2["default"])(args)));

                case 6:
                  result = _context2.sent;
                  process.send({
                    id: id,
                    result: result
                  });
                  _context2.next = 13;
                  break;

                case 10:
                  _context2.prev = 10;
                  _context2.t0 = _context2["catch"](3);
                  process.send({
                    id: id,
                    error: _context2.t0
                  });

                case 13:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2, null, [[3, 10]]);
        }));

        return function onMessage() {
          return _ref2.apply(this, arguments);
        };
      }(); // esperar uma resposta do worker


      worker.on('message', onMessage);
      this.printLogAttachSuccess();
    }
    /**
     * getWrappedEndpoint - Catch errors and normalize before return for crossbar engine
     *
     * @param {array} args Description
     *
     * @returns {type} Description
     */

  }, {
    key: "getMasterWrappedEndpoint",
    value: function getMasterWrappedEndpoint() {
      var _this2 = this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return new Promise( /*#__PURE__*/function () {
        var _ref3 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(resolve, reject) {
          var w, attempts, id, onMessage;
          return _regenerator["default"].wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  _context3.prev = 0;
                  attempts = 0;

                case 2:
                  attempts++; // pegar o primeiro worker e jogar pro final da fila

                  w = _Application["default"].workers.shift();

                  _Application["default"].workers.push(w); // se todos os workers estiverem ocupados esperar um pouco pra ver se alguem se libera


                  if (!(attempts < WORKERS_AWAIT_MAX_ATTEMPTS && _Application["default"].workers.filter(function (x) {
                    return x.isBusy;
                  }).length === WORKERS_TOTAL)) {
                    _context3.next = 10;
                    break;
                  }

                  _context3.next = 8;
                  return snooze(WORKERS_AWAIT_TIMEOUT);

                case 8:
                  _context3.next = 12;
                  break;

                case 10:
                  if (!(attempts > WORKERS_AWAIT_MAX_ATTEMPTS)) {
                    _context3.next = 12;
                    break;
                  }

                  return _context3.abrupt("break", 13);

                case 12:
                  if (w.isBusy) {
                    _context3.next = 2;
                    break;
                  }

                case 13:
                  attempts = 0; // w = application.workers.shift()
                  // application.workers.push(w)
                  // gerar um ID para esse processamento

                  id = (0, _uuid.v1)(); // enviar para o worker (subprocesso)

                  if (w.isConnected()) {
                    w.isBusy = true;
                    w.send({
                      type: "route:".concat(_this2.uri),
                      id: id,
                      args: args
                    });
                  } else {
                    w.on('online', function () {
                      w.isBusy = true;
                      w.send({
                        type: "route:".concat(_this2.uri),
                        id: id,
                        args: args
                      });
                    });
                  } // esperar resposta do worker


                  onMessage = function onMessage(responseWorker, response) {
                    responseWorker.isBusy = false;
                    var result = response.result,
                        error = response.error;

                    if (response.id === id) {
                      // remover listener deposi que receber a resposta do worker
                      _cluster["default"].off('message', onMessage); // verifica se o endpoint do worker deu erro


                      if (typeof error !== 'undefined') {
                        return reject(error);
                      } // devolve para o cliente que chamou a rota RPC ou PUBSUB o resultado do endpoint


                      resolve(result);
                    }
                  }; // esperar a resposta do worker para processar a resposta


                  _cluster["default"].on('message', onMessage);

                  _cluster["default"].on('exit', function (worker, code, signal) {
                    worker.isBusy = false;

                    if (worker.id === w.id) {
                      console.log("[".concat(_this2.uri, "] Worker ").concat(worker.process.pid, " died with code: ").concat(code, ", and signal: ").concat(signal));
                      reject("[".concat(_this2.uri, "] Worker ").concat(worker.process.pid, " died with code: ").concat(code, ", and signal: ").concat(signal));
                    }
                  });

                  _context3.next = 25;
                  break;

                case 21:
                  _context3.prev = 21;
                  _context3.t0 = _context3["catch"](0);
                  (0, _normalize["default"])(_context3.t0);
                  reject(_context3.t0);

                case 25:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3, null, [[0, 21]]);
        }));

        return function (_x2, _x3) {
          return _ref3.apply(this, arguments);
        };
      }());
    }
    /**
     * getWrappedEndpoint - Captura erros e normaliza antes de retornar para engine do crossbar
     *
     * @param {array} args Description
     *
     * @returns {type} Description
     */

  }, {
    key: "getWrappedEndpoint",
    value: function getWrappedEndpoint() {
      var _this3 = this;

      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return new Promise(function (resolve, reject) {
        try {
          // console.log(`getWrappedEndpoint`, `args[0]`, args[0], `args[1]`, args[1], `args[2]`, args[2])
          // instanciar o Controller que mantem so parametros da chamada
          _this3.routeController = new RouteController({
            args: args[0],
            kwargs: args[1],
            details: args[2],
            session: _this3.session
          });

          var result = _this3.endpoint.apply(_this3, args);

          if (typeof result !== 'undefined' && (result instanceof Promise || result !== null) && typeof result.then === 'function') {
            result.then(resolve)["catch"](function (err) {
              // add toJSON()
              (0, _normalize["default"])(err);

              if (_this3.log) {
                _this3.printLogAttachFail(err);
              }

              reject(err);
            });
          }
        } catch (err) {
          (0, _normalize["default"])(err);
          reject(err);
        }
      });
    }
    /**
     * Make an RPC call sending protocol data for the caller
     * @param  {String} name rota: `route.myRPCRoute
     * @param  {Mixed} payload the same that "wargs" on procedure
     * @return {Promise}
     */

  }, {
    key: "call",
    value: function call(name, payload) {
      return this.routeController.call(name, payload);
    }
    /**
     * endpoint - Attached method to crossbar session that will response the call
     *
     * ```js
     * Route.attach(session)
     * // the same that:
     * session.register(route.uri, route.endpoint, route.options)
     * ```
     *
     * @memberof module:lib/routes.Route
     * @method endPoint
     * @instance
     * @param {Array} args    Description
     * @param {Object} kwargs  Description
     * @param {Object} details Description
     * @returns {Promise}
     */

  }, {
    key: "endpoint",
    value: function endpoint() {
      var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var kwargs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var details = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    }
  }, {
    key: "clientApplication",
    get: function get() {
      return this.routeController.clientApplication;
    }
  }], [{
    key: "extend",
    value: function extend(fromRoute) {
      var route = new this();
      route.routeController = fromRoute.routeController;
      route.session = fromRoute.session;
      return route;
    }
    /**
     * Configura a rota em uma session wamp via Autobahn
     *
     * @memberof module:lib/routes.Route
     * @static
     * @param {Object} session
     * @return {Object}
     */

  }, {
    key: "attach",
    value: function attach(session) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var route = new this(options);
      route.setSession(session);
      return route;
    }
  }]);
  return Route;
}();

exports["default"] = Route;
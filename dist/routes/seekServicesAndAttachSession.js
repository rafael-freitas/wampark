"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = seekServicesAndAttachSession;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _store = _interopRequireDefault(require("../store"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/**
 * Procura recursivamente por arquivos index.mjs que contenham classes Route para atachar na session
 * @param  {String} currentDir Diretorio de busca
 * @param  {Session} session Session do Express ou do Autobahn
 */
function seekServicesAndAttachSession(currentDir, session) {
  var rootdir = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  var _iterator = _createForOfIteratorHelper(_fs["default"].readdirSync(currentDir)),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var child = _step.value;

      var currentPath = _path["default"].join(currentDir, child);

      try {
        if (_fs["default"].statSync(currentPath).isDirectory()) {
          seekServicesAndAttachSession(currentPath, session, false);
        } else {
          // so incluir arquivos index.mjs. todas as rotas devem estar em arquivos index.mjs
          if (_fs["default"].statSync(currentPath).isFile() && child.includes('index.') && !rootdir) {
            var service = null;

            var module = require(currentPath); // tratamento do polyfill


            if (module.__esModule) {
              service = module["default"];
            } else {
              service = module;
            }

            _store["default"].use(service, session);
          }
        }
      } catch (e) {
        // erro com o diretorio, igonorar e continuar
        console.error(e);
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
}
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = seekRoutesAndAttachSession;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/**
 * Procura recursivamente por arquivos index.mjs que contenham classes Route para atachar na session
 * @param  {String} currentDir Diretorio de busca
 * @param  {Session} session Session do Express ou do Autobahn
 */
function seekRoutesAndAttachSession(currentDir, session) {
  var _iterator = _createForOfIteratorHelper(_fs["default"].readdirSync(currentDir)),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var child = _step.value;

      var currentPath = _path["default"].join(currentDir, child);

      try {
        if (_fs["default"].statSync(currentPath).isDirectory()) {
          seekRoutesAndAttachSession(currentPath, session);
        } else {
          // so incluir arquivos index.mjs. todas as rotas devem estar em arquivos index.mjs
          if (_fs["default"].statSync(currentPath).isFile() && child.includes('index.')) {
            var Route = null;

            var module = require(currentPath); // tratamento do polyfill


            if (module.__esModule) {
              Route = module["default"];
            } else {
              Route = module;
            } // checar se o retorno do arquivo é uma Classe e tem o metodo statico attach()


            if (isClass(Route) && Route.attach) {
              Route.attach(session);
            }
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

function isClass(func) {
  return typeof func === 'function' && /^class\s/.test(Function.prototype.toString.call(func));
}
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _Agent = _interopRequireDefault(require("./Agent"));

/**
 * Gerenciador de processos do sistema
 *
 * @requires {@link module:lib/agent.Agent}
 *
 * @author     Rafael Freitas
 * @date       Apr 22 2018
 * @module lib/agent
 * @example
 * import agent from '/lib/agent'
 */
var _default = new _Agent["default"]();

exports["default"] = _default;
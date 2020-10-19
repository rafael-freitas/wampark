/**
 * @description
 * Tipo de rotas e metodos http para configuração de Router
 *
 * {@link https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol}
 * @memberof  module:lib/routes
 * @static
 * @type     {Object}
 * @property {String} RPC rpc
 * @property {String} PUBSUB pubsub
 * @property {String} ALL all
 * @property {String} PUT put
 * @property {String} PATCH patch
 * @property {String} CONNECT connect
 * @property {String} OPTIONS options
 * @property {String} TRACE trace
 * @property {String} HEAD head
 * @property {String} DELETE delete
 * @property {String} UPDATE update
 * @property {String} POST post
 * @property {String} GET get
 */
const RouteTypes = {
  RPC: 'rpc',
  PUBSUB: 'pubsub',
  ALL: 'all',
  PUT: 'put',
  PATCH: 'patch',
  CONNECT: 'connect',
  OPTIONS: 'options',
  TRACE: 'trace',
  HEAD: 'head',
  DELETE: 'delete',
  UPDATE: 'update',
  POST: 'post',
  GET: 'get'
}

export default RouteTypes

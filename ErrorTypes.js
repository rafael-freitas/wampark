/**
 * Tipos de erros
 * @memberof module:lib/errors
 * @static
 * @type {Object}
 * @property {Number} RUNTIME Erro de execução
 * @property {Number} SYNTAX Erro de sintaxe
 * @property {Number} LOGIC Erro lançados no backend
 * @property {Number} CONNECTION Erro de conexão do WAMP
 * @property {Number} DATABASE Erro de conexão do Mongoose
 * @property {Number} THROWABLE Erros menor que 100 levantaram exception
 * @property {Number} MESSAGE Mensagem de erro. (O erro deve ser tratado como mensagem no frontend)
 * @property {Number} PROC_CANCELED Quando o processo for cancelado pelo usuário, não será necessario exibir mensagem de error
 */
const ErrorTypes = {
  RUNTIME: 0,
  SYNTAX: 1,
  LOGIC: 2,
  CONNECTION: 4,
  DATABASE: 5,
  THROWABLE: 100,
  MESSAGE: 101,
  PROC_CANCELED: 200
}

export default ErrorTypes

/**
 * @description
 * normalizeError - Adiciona o metodo toJSON() em um objeto nativo Error
 * para exportar o erro durante serializacao para JSON
 * @memberof module:lib/errors
 * @method normalizeError
 * @param {Error} err Erro a ser inspecionado
 */
function normalizeError (err) {
  if (err instanceof Error && typeof err.toJSON !== 'function') {
    err.toJSON = function () {
      return Object.assign({}, this, {
        name: err.constructor.name,
        message: err.message,
        stack: String(err.stack)
      })
    }
  }
}

export default normalizeError

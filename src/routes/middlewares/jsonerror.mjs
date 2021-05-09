/**
* ******************************************************************************************************
*
*   jsonError
*
*     Middleware para envio output de objetos de erros nativos em json para Express JS
*
*
*   @author     Rafael Freitas
*   @date       Apr 22 2018
*
*   @memberof module:lib/routes
*
* ******************************************************************************************************
*/
export default function (req, res, next) {
  const STATUS = 400

  /**
   * jsonFromError - Converte uma instance de Error em json
   *
   * @param {type} error Objeto de erro (instancia de Error) para converter em json
   *
   */
  res.jsonFromError = function (error) {
    if (error instanceof Promise) {
      error.catch(err => {
        normalize(err)
        let data = err.toString()
        if (err.toJSON) {
          data = err.toJSON()
        }
        return res.status(STATUS).json(data)
      })
    } else {
      normalize(error)
      let data = error
      if (error && error.toJSON) {
        data = error.toJSON()
      } else {
        data = {
          error: error.toString()
        }
      }
      return res.status(STATUS).json(data)
    }
  }
  // end jsonError
  next()
}

/**
 * normalize - Adiciona o metodo toJSON() em um objeto nativo Error
 * para exportar o erro durante serializacao para JSON
 * @param {Error} err Erro a ser inspecionado
 */
function normalize (err) {
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

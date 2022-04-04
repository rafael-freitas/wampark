import fs from 'fs'
import path from 'path'

/**
 * Procura recursivamente por arquivos index.mjs que contenham classes Route para atachar na session
 * @param  {String} currentDir Diretorio de busca
 * @param  {Session} session Session do Express ou do Autobahn
 */
export default function seekRoutesAndAttachSession (currentDir, session) {
  for (const child of fs.readdirSync(currentDir)) {
    const currentPath = path.join(currentDir, child)
    try {
      if (fs.statSync(currentPath).isDirectory()) {
        seekRoutesAndAttachSession(currentPath, session)
      } else {
        // so incluir arquivos index.mjs. todas as rotas devem estar em arquivos index.mjs
        if (fs.statSync(currentPath).isFile() && child.includes('index.')) {
          let Route = null
          const module = require(currentPath)
          // tratamento do polyfill
          if (module.__esModule) {
            Route = module.default
          } else {
            Route = module
          }
          // checar se o retorno do arquivo é uma Classe e tem o metodo statico attach()
          if (isClass(Route) && Route.attach) {
            Route.attach(session)
          }
        }
      }
    } catch (e) {
      // erro com o diretorio, igonorar e continuar
      console.error(e)
    }
  }
}

function isClass (func) {
  return typeof func === 'function' &&
    /^class\s/.test(Function.prototype.toString.call(func))
}

import fs from 'fs'
import path from 'path'
import store from '../store'

/**
 * Procura recursivamente por arquivos index.mjs que contenham classes Route para atachar na session
 * @param  {String} currentDir Diretorio de busca
 * @param  {Session} session Session do Express ou do Autobahn
 */
export default function seekServicesAndAttachSession (currentDir, session, rootdir = true) {
  for (const child of fs.readdirSync(currentDir)) {
    const currentPath = path.join(currentDir, child)
    try {
      if (fs.statSync(currentPath).isDirectory()) {
        seekServicesAndAttachSession(currentPath, session, false)
      } else {
        // so incluir arquivos index.mjs. todas as rotas devem estar em arquivos index.mjs
        if (fs.statSync(currentPath).isFile() && child.includes('index.') && !rootdir) {
          let service = null
          const module = require(currentPath)
          // tratamento do polyfill
          if (module.__esModule) {
            service = module.default
          } else {
            service = module
          }
          store.use(service, session)
        }
      }
    } catch (e) {
      // erro com o diretorio, igonorar e continuar
      console.error(e)
    }
  }
}

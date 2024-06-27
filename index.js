import application, {DevkitApplication} from "./Application.js"
import Route from "./Route.js"
import RouteTypes from "./RouteTypes.js"
import Component from "./Component.js"
import WampAdapter from "./WampAdapter.js"
import ApplicationError from "./ApplicationError.js"
import logger from "./logger/index.js"
import ApplicationLogger from "./ApplicationLogger.js"
import dotenv from 'dotenv'

export default application

export {
  DevkitApplication,
  ApplicationLogger,
  ApplicationError,
  WampAdapter,
  Route,
  RouteTypes,
  Component,
  logger,
}

// Defina o ambiente padrão como desenvolvimento
const env = process.env.NODE_ENV || 'development'

// Mapeie os diferentes ambientes para seus respectivos arquivos .env
dotenv.config({ path: `.env.${env}`, override: true })
dotenv.config({ path: `.env.local`, override: true })
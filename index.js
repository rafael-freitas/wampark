import application from './src/index.js'

// set application to global to aviod multiple instances
if (!global._APPLICATION) {
  global._APPLICATION = application
}

export default global._APPLICATION || application
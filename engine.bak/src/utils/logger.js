const {
  environment,
  functionName,
  isDev,
  semver,
  version
} = require('../../environment')

const LOG_LEVELS = {
  ERROR: 'error',
  INFO: 'info',
  WARN: 'warn'
}

const LOG_TYPES = {
  CACHE: 'cache',
  COMPONENT: 'component',
  FETCH_FROM_SOURCE: 'fetching from source',
  PAGE_RENDER_TIME: 'page rendering time',
  RENDERING: 'rendering',
  WEBPACK_COMPILATION: 'webpack compilation'
}

const logError = (isDev)
  ? function logError (logData) {
    console.error(logData.stackTrace)
  }
  : function logError (logData) {
    const logObject = getJSONLogObject(LOG_LEVELS.ERROR, logData)
    console.error(`${LOG_LEVELS.ERROR}: ${logObject}`)
  }

const logWarn = (isDev)
  ? function logWarn (logData) {
    console.warn(logData.message)
    console.warn(logData.stackTrace)
  }
  : function logWarn (logData) {
    const logObject = getJSONLogObject(LOG_LEVELS.WARN, logData)
    console.warn(`${LOG_LEVELS.WARN}: ${logObject}`)
  }

const logInfo = (isDev)
  ? function logInfo (logData) {
    console.info(logData.message)
  }
  : function logInfo (logData) {
    const logObject = getJSONLogObject(LOG_LEVELS.INFO, logData)
    console.info(`${LOG_LEVELS.INFO}: ${logObject}`)
  }

function getJSONLogObject (logLevel, { logType = '', message = 'no message provided', stackTrace = '', values = {} }) {
  return JSON.stringify({
    environment,
    functionName,
    fusionVersion: semver,
    lambdaDeployment: version,
    logLevel,
    message,
    logType,
    stackTrace,
    values // an example of values: { 'feature 1': '100ms' }
  })
}

module.exports = {
  LOG_TYPES,
  logError,
  logInfo,
  logWarn
}

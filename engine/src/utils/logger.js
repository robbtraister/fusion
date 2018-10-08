const { environment, semver, version, functionName } = require('../../environment')

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

const logInformation = function logInformation (logInfo) {
  const logObject = getJSONLogObject(LOG_LEVELS.INFO, logInfo)
  console.info(`${LOG_LEVELS.INFO}: ${logObject}`)
}

const logError = function logError (logInfo) {
  const logObject = getJSONLogObject(LOG_LEVELS.ERROR, logInfo)
  console.error(`${LOG_LEVELS.ERROR}: ${logObject}`)
}

const logWarning = function logWarning (logInfo) {
  const logObject = getJSONLogObject(LOG_LEVELS.WARN, logInfo)
  console.warn(`${LOG_LEVELS.WARN}: ${logObject}`)
}

function getJSONLogObject (logLevel, {logType = '', message = 'no message provided', stackTrace = '', values = {}}) {
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
  logInformation,
  logWarning
}

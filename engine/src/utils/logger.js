const { environment, semver, version, functionName } = require('../../environment')

const LOG_LEVELS = {
  ERROR: 'error',
  INFO: 'info',
  WARN: 'warn'
}

const LOG_TYPES = {
  PAGE_RENDER_TIME: 'page rendering time',
  WEBPACK_COMPILATION: 'webpack compilation'
}

const information = (logInfo) => {
  const logObject = getJSONLogObject(LOG_LEVELS.INFO, logInfo)
  console.info(`${LOG_LEVELS.INFO}: ${logObject}`)
}

const error = (logInfo) => {
  const logObject = getJSONLogObject(LOG_LEVELS.ERROR, logInfo)
  console.error(`${LOG_LEVELS.ERROR}: ${logObject}`)
}

const warning = (logInfo) => {
  const logObject = getJSONLogObject(LOG_LEVELS.WARN, logInfo)
  console.warn(`${LOG_LEVELS.WARN}: ${logObject}`)
}

function getJSONLogObject (logLevel, {logType = '', message = 'no message provided', values = {}}) {
  return JSON.stringify({
    environment,
    functionName,
    logLevel,
    message,
    logType,
    fusionVersion: semver,
    values, // an example of values: { 'feature 1': '100ms' }
    lambdaDeployment: version
  })
}

module.exports = {
  LOG_TYPES,
  error,
  information,
  warning
}

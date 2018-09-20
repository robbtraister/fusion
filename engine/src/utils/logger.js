const { environment, semver, version, functionName } = require('../../environment')

const LOG_LEVELS = {
  ERROR: 'error',
  INFO: 'info',
  WARN: 'warn'
}

const logInformation = (message, values) => {
  const logObject = getJSONLogObject(LOG_LEVELS.INFO, message, values)
  console.info(`${LOG_LEVELS.INFO}: ${logObject}`)
}

const logError = (message, values) => {
  const logObject = getJSONLogObject(LOG_LEVELS.ERROR, message, values)
  console.error(`${LOG_LEVELS.ERROR}: ${logObject}`)
}

const logWarning = (message, values) => {
  const logObject = getJSONLogObject(LOG_LEVELS.WARN, message, values)
  console.warn(`${LOG_LEVELS.WARN}: ${logObject}`)
}

function getJSONLogObject (logLevel, message = 'no message provided', values = {}) {
  return JSON.stringify({
    environment,
    functionName,
    logLevel,
    message,
    logType: 'page rendering time',
    fusionVersion: semver,
    values, // an example of values: { 'feature 1': '100ms' }
    lambdaDeployment: version
  })
}

module.exports = {
  logError,
  logInformation,
  logWarning
}

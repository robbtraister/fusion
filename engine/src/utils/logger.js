const { environment, semver, version, functionName } = require('../../environment')

const LOG_LEVELS = {
  ERROR: 'error',
  INFO: 'info',
  WARN: 'warn'
}

const logInformation = (message) => {
  const logObject = getLogObject(LOG_LEVELS.INFO, message)

  console.info(`${LOG_LEVELS.INFO}: ${JSON.stringify(logObject)}`)
}

const logError = (message) => {
  const logObject = getLogObject(LOG_LEVELS.ERROR, message)

  console.error(`${LOG_LEVELS.ERROR}: ${JSON.stringify(logObject)}`)
}

const logWarning = (message) => {
  const logObject = getLogObject(LOG_LEVELS.WARN, message)

  console.warn(`${LOG_LEVELS.WARN}: ${JSON.stringify(logObject)}`)
}

function getLogObject (logLevel, message) {
  return {
    environment,
    functionName,
    logLevel,
    message,
    logType: 'page rendering time',
    fusionVersion: semver,
    values: { 'feature 1': '100ms' },
    lambdaDeployment: version
  }
}

module.exports = {
  logError,
  logInformation,
  logWarning
}

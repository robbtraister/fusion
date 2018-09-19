const { environment, semver, version, functionName } = require('../../environment')

const LOG_LEVELS = {
  ERROR: 'error',
  INFO: 'info',
  WARN: 'warning'
}

const logInformation = (message) => {
  const logObject = getLogObject(LOG_LEVELS.INFO, message)

  console.info(JSON.stringify(logObject))
}

const logError = (message) => {
  const logObject = getLogObject(LOG_LEVELS.ERROR, message)

  console.error(JSON.stringify(logObject))
}

const logWarning = (message) => {
  const logObject = getLogObject(LOG_LEVELS.WARN, message)

  console.warn(JSON.stringify(logObject))
}

function getLogObject (logLevel, message) {
  return {
    environment,
    functionName,
    logLevel,
    message,
    logType: 'page rendering time',
    semver,
    values: { 'feature 1': '100ms' },
    version
  }
}

module.exports = {
  logError,
  logInformation,
  logWarning
}

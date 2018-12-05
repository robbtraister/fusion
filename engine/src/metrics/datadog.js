'use strict'

const request = require('request-promise-native')

const {
  datadogApiKey,
  deployment,
  environment,
  metricsTimeout,
  semver
} = require('../../environment')

const metricsMap = {}

const baseTagsForEngine = [
  'app:fusion',
  'function-type:engine',
  `engine-version:${semver}`,
  `lambda-deployment:${deployment}`,
  `environment:${environment}`
]

/**
 * Takes the metrics array, formats the objects to match what DataDog is expecting, and makes the POST request
 * @param {Object[]} metrics One or more metrics to be sent to DataDog
 * @param {string} metrics[].type A constant that specifies the type of metric to be sent (METRIC_TYPES are defined above)
 * @param {number} metrics[].value The actual value to send to DataDog (e.g. we want to send a duration of half a second, we send [.5])
 * @param {Array} metrics[].tags [OPTIONAL] The tags associated with this metric (e.g. [operation:fetch, result:success])
 * @returns {undefined} No return value
 */
const sendMetrics = function sendMetrics (metrics) {
  const timestamp = getTimestamp()
  const series = Object.keys(metrics)
    .map((type) => {
      const metric = metrics[type]
      const { value, ...tags } = metric
      return {
        metric: type,
        points: [[timestamp, [value]]],
        tags: [
          ...baseTagsForEngine,
          ...Object.keys(tags).map((tag) => `${tag}:${tags[tag]}`)
        ]
      }
    })

  const requestOptions = {
    method: 'POST',
    uri: `https://api.datadoghq.com/api/v1/distribution_points?api_key=${datadogApiKey}`,
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: metricsTimeout,
    body: JSON.stringify({ series })
  }

  const metricsPromises = metricsMap[global.awsRequestId] || []
  metricsPromises.push(request(requestOptions).catch(() => null))
  metricsMap[global.awsRequestId] = metricsPromises
}

/**
 * Resolves all metrics promises for the current (globally set) AWS request
 */
const resolveMetrics = async function resolveMetrics () {
  if (metricsMap[global.awsRequestId] && metricsMap[global.awsRequestId].length) {
    await Promise.all(metricsMap[global.awsRequestId])
    delete metricsMap[global.awsRequestId]
  }
}

function getTimestamp () {
  return Math.round(Date.now() / 1000)
}

module.exports = sendMetrics
module.exports.sendMetrics = sendMetrics
module.exports.resolveMetrics = resolveMetrics

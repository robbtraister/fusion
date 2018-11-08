const request = require('request-promise-native')
const { datadogApiKey, deployment, environment, isDev, semver } = require('../../environment')

const metricsMap = {}

const METRIC_TYPES = {
  CACHE_LATENCY: 'arc.fusion.cache.latency',
  CACHE_RESULT: 'arc.fusion.cache.result',
  CACHE_RESULT_SIZE: 'arc.fusion.cache.bytes',
  COMPILE_DURATION: 'arc.fusion.compile.duration',
  CONTENT_LATENCY: 'arc.fusion.content.latency',
  CONTENT_RESULT: 'arc.fusion.content.result',
  CONTENT_RESULT_SIZE: 'arc.fusion.content.bytes',
  DB_DURATION: 'arc.fusion.db.duration',
  DB_RESULT: 'arc.fusion.db.result',
  RENDER_DURATION: 'arc.fusion.render.duration',
  RENDER_RESULT: 'arc.fusion.render.result',
  WEBPACK_DURATION: 'arc.fusion.webpack.duration'
}

/**
 * Takes the metrics array, formats the objects to match what DataDog is expecting, and makes the POST request
 * @param {Object[]} metrics One or more metrics to be sent to DataDog
 * @param {string} metrics[].type A constant that specifies the type of metric to be sent (METRIC_TYPES are defined above)
 * @param {number} metrics[].value The actual value to send to DataDog (e.g. we want to send a duration of half a second, we send [.5])
 * @param {Array} metrics[].tags [OPTIONAL] The tags associated with this metric (e.g. [operation:fetch, result:success])
 * @returns {undefined} No return value
 */
const sendMetrics = function sendMetrics (metrics) {
  const baseTagsForEngine = [
    'app:fusion',
    'function-type:engine',
    `engine-version:${semver}`,
    `lambda-deployment:${deployment}`,
    `environment:${environment}`
  ]

  const metricsToSend = {
    series: metrics.map(metric => {
      return {
        metric: metric.type,
        points: [[getTimestamp(), [metric.value]]],
        tags: [...baseTagsForEngine, ...metric.tags]
      }
    })
  }

  const requestOptions = {
    method: 'POST',
    uri: `https://api.datadoghq.com/api/v1/distribution_points?api_key=${datadogApiKey}`,
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 1000,
    body: JSON.stringify(metricsToSend)
  }

  const metricsPromises = metricsMap[global.awsRequestId] || []
  metricsPromises.push(request(requestOptions).catch((err) => { console.log(err.message) }))
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

/**
 * This stub is exported if we're in dev because we don't care about sending metrics from dev
 */
const sendMetricsStub = () => {}

module.exports = {
  METRIC_TYPES,
  sendMetrics: (!isDev && datadogApiKey) ? sendMetrics : sendMetricsStub,
  resolveMetrics
}

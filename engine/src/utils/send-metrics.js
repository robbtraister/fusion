const request = require('request')
const { datadogApiKey, environment, isDev, semver, version } = require('../../environment')

const METRIC_TYPES = {
  CACHE_LATENCY: 'arc.fusion.cache.latency',
  CACHE_RESULT: 'arc.fusion.cache.result',
  COMPILE_DURATION: 'arc.fusion.compile.duration',
  CONTENT_LATENCY: 'arc.fusion.content.latency',
  CONTENT_RESULT: 'arc.fusion.content.result',
  RENDER_DURATION: 'arc.fusion.render.duration',
  RENDER_RESULT: 'arc.fusion.render.result',
  WEBPACK_DURATION: 'arc.fusion.webpack.duration'
}

/**
 * Takes the metric values, adds them to the object that DataDog is expecting, and makes the POST request
 * @param {Object[]} metrics One or more metrics to be sent to DataDog
 * @param {string} metrics[].type A constant that specifies the type of metric to be sent (these values are in the METRIC_TYPES object in the ./constants/metrics file)
 * @param {Array} metrics[].value The actual value to send to DataDog (e.g. we want to send a duration of half a second, we send [.5])
 * @param {Array} metrics[].tags [OPTIONAL] The tags associated with this metric
 * @returns {undefined} No return value
 */
const sendMetrics = (metrics) => {
  const metricsToSend = {
    series: metrics.map(metric => {
      return {
        metric: metric.type,
        points: [[getTimestamp(), [metric.value]]],
        tags: ['app:fusion', `engine-version:${semver}`, `lambda-deployment:${version}`, `environment:${environment}`, ...metric.tags]
      }
    })
  }

  const requestOptions = {
    method: 'POST',
    uri: `https://api.datadoghq.com/api/v1/distribution_points?api_key=${datadogApiKey}`,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metricsToSend)
  }

  request(requestOptions)
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
  sendMetrics: (!isDev && datadogApiKey) ? sendMetrics : sendMetricsStub
}

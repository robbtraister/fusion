'use strict'

const url = require('url')

const AWS = require('aws-sdk')

/**
 * Map the http request into a lambda request.
 * Assumes the following express.js middlewares have been added:
 * - https://github.com/expressjs/cookie-parser
 * - https://www.npmjs.org/package/body-parser
 *   - app.use(bodyParser.json()); // for parsing application/json
 *   - app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
 *
 * @param req
 * @returns {{FunctionName, Payload}}
 */
const mapRequest = function mapRequest (req) {
  const parts = url.parse(req.originalUrl, true)
  const LogType = req.header('x-LogType') || 'None'
  const payload = {
    FunctionName: req.header('x-FunctionName'),
    InvocationType: 'RequestResponse',
    LogType,
    Payload: JSON.stringify({
      method: req.method,
      // serverless-http uses `httpMethod` property
      httpMethod: req.method,
      headers: req.headers,
      body: req.body,
      cookies: req.cookies,
      path: parts.pathname,
      protocol: req.protocol,
      queryStringParameters: parts.query
    }),
    Qualifier: req.header('x-Qualifier')
  }
  return payload
}

const mapResponse = function mapResponse (err, data, res) {
  if (err) {
    res.status(500).send(err)
  } else {
    const payload = data.Payload ? JSON.parse(data.Payload) : null
    const statusCode = (data.FunctionError)
      ? 500
      : (data.StatusCode === 200 && payload && payload.statusCode)
        ? payload.statusCode
        : data.StatusCode
    res.status(statusCode)

    if (payload && payload.headers) {
      res.set(payload.headers)
    }

    if (payload && payload.cookies && payload.cookies.length) {
      payload.cookies.forEach((cookie) => {
        res.cookie(cookie.name, cookie.value, cookie.options)
      })
    }

    if (payload && payload.redirect) {
      res.redirect(statusCode, payload.redirect)
    } else {
      const payloadOut = (payload && payload.body)
        ? (payload.isBase64Encoded ? Buffer.from(payload.body, 'base64') : payload.body)
        : (payload || null)

      res.send(payloadOut)
    }
  }
}

function getOptions (req) {
  const functionName = req.header('x-FunctionName')

  const region = (functionName && /^arn:aws:lambda:/.test(functionName))
    ? functionName.split(':')[3]
    : req.header('x-Region')

  return {region}
}

/**
 * Proxy the express.js req/res to an AWS Lambda call.
 *
 * @param req
 * @param res
 * @param callback
 */
const invoke = function invoke (options) {
  options = options || {}

  return function invoke (req, res, next) {
    if (!req.header('x-FunctionName')) {
      res.status(400).send("Please provide an AWS Lambda function name in the form of a 'x-FunctionName' header.")
    } else {
      const lambda = new AWS.Lambda(Object.assign({region: 'us-east-1'}, options, getOptions(req)))
      lambda.invoke(mapRequest(req), function (err, data) {
        mapResponse(err, data, res)
      })
    }
  }
}

module.exports = {
  invoke
}

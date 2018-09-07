'use strict'

const promisify = require('util').promisify

const AWS = require('aws-sdk')

const {
  resolverName
} = require('../configs')

const lambda = new AWS.Lambda()

const deleteFunction = promisify(lambda.deleteFunction.bind(lambda))
const listVersionsByFunction = promisify(lambda.listVersionsByFunction.bind(lambda))

async function cleanup (contextName) {
  const FunctionName = resolverName(contextName)
  return listVersionsByFunction({FunctionName})
    .then(({Versions}) => Promise.all(
      Versions
        // ignore '$LATEST'
        .filter(v => +v.Version)
        // keep the 3 most recent versions (desc sort, then ignore the first 3)
        .sort((v1, v2) => +v2.Version - +v1.Version)
        .slice(3)
        .map(({Version}) => deleteFunction({FunctionName, Qualifier: Version}))
    ))
}

module.exports = cleanup

if (module === require.main) {
  cleanup('bonnier-fusion-sandbox')
}

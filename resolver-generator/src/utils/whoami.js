'use strict'

const STS = require('AWS-SDK').STS

const sts = new STS()
const callerPromise = sts.getCallerIdentity().promise()

module.exports = {
  getAccountId: async () => callerPromise.then(({Account}) => Account),
  getArn: async () => callerPromise.then(({Arn}) => Arn)
}

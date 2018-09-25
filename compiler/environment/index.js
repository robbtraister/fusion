'use strict'

module.exports = {
  environment: process.env.ENVIRONMENT,
  region: process.env.REGION,
  S3BucketVersioned: process.env.S3BUCKET_VERSIONED,
  S3BucketDiscrete: process.env.S3BUCKET_DISCRETE
}

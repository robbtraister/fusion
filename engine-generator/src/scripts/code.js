'use strict'

module.exports = (deployment, versionId) => {
  const code = {
    S3Bucket: 'pagebuilder-fusion',
    S3Key: `${deployment}/code.zip`
  }

  if (versionId) {
    code.S3ObjectVersion = versionId
  }

  return code
}

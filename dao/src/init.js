#!/usr/bin/env node

'use strict'

const childProcess = require('child_process')
const fs = require('fs')

const md5 = require('apache-md5')

const envVarMatch = /^([A-Z_]+)_CREDENTIALS$/

function formatCredentials (credentialString) {
  return credentialString
    .split(/\s/)
    .filter(c => c)
    .map(credentials => {
      const credPieces = credentials.split(':', 2)
      return `${credPieces[0]}:${md5(credPieces[1])}`
    })
    .join('\n')
}

childProcess.execSync(`mkdir -p "./conf/credentials"`)

Object.keys(process.env)
  .map(key => envVarMatch.exec(key))
  .filter(match => match)
  .map(match => match[1])
  .forEach(env => {
    fs.writeFileSync(
      `./conf/credentials/${env}.passwords`,
      formatCredentials(process.env[`${env}_CREDENTIALS`])
    )
  })

#!/usr/bin/env node

'use strict'

const childProcess = require('child_process')
const fs = require('fs')

const md5 = require('apache-md5')

function formatCredentials (credentialsMap) {
  return Object.keys(credentialsMap)
    .map(user => `${user}:${md5(credentialsMap[user])}`)
    .join('\n')
}

childProcess.execSync(`mkdir -p "./conf/credentials"`)

const envs = {}
process.env.DAO_CREDENTIALS
  .split(/\s/)
  .map(c => c.trim())
  .filter(c => c)
  .map(c => c.split('|'))
  .forEach(([env, user, password]) => {
    envs[env] = envs[env] || {}
    envs[env][user] = password
  })

Object.keys(envs)
  .forEach(env => {
    fs.writeFileSync(
      `./conf/credentials/${env}.passwords`,
      formatCredentials(envs[env])
    )
  })

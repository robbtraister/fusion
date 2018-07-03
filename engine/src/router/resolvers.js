'use strict'

// const childProcess = require('child_process')
// const fs = require('fs')
// const path = require('path')

const bodyParser = require('body-parser')
const express = require('express')

const {
  getBucket
} = require('../assets/info')

const {
  bodyLimit,
  environment,
  isDev,
  region
} = require('../../environment')

const handler = (isDev)
  ? (() => {
    // const filePath = path.resolve(`${distRoot}/resolvers.json`)
    //
    // return (req, res, next) => {
    //   new Promise((resolve, reject) => {
    //     childProcess.exec(`mkdir -p ${path.dirname(filePath)}`, (err) => {
    //       err ? reject(err) : resolve()
    //     })
    //   })
    //     .then(() => new Promise((resolve, reject) => {
    //       fs.writeFile(filePath, req.body, (err) => {
    //         err ? reject(err) : resolve()
    //       })
    //     }))
    //     .then(next)
    // }

    // the above is unnecessary on local dev; resolver just reads from db
    return (req, res, next) => next()
  })()
  : (() => {
    const S3 = require('aws-sdk').S3
    const s3 = new S3({region})

    const Bucket = getBucket()
    const Key = `environments/${environment}/resolvers.json`

    return (req, res, next) => {
      new Promise((resolve, reject) => {
        try {
          const Body = JSON.stringify(req.body, null, 2)
          s3.upload({
            Bucket,
            Key,
            Body,
            ACL: 'private',
            ContentType: 'application/json'
          }, (err, data) => {
            err ? reject(err) : resolve(data)
          })
        } catch (e) {
          reject(e)
        }
      })
        .then(() => { next() })
        .catch(next)
    }
  })()

const resolverRouter = express.Router()

resolverRouter.post('/',
  bodyParser.json({limit: bodyLimit}),
  handler,
  (req, res) => { res.sendStatus(204) }
)

module.exports = resolverRouter

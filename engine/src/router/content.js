'use strict'

const express = require('express')

const getSource = require('../models/sources')

const contentRouter = express.Router()

contentRouter.route(['/fetch', '/fetch/:source', '/fetch/:source/:key'])
  .get((req, res, next) => {
    const sourceName = req.params.source || req.query.source
    const keyString = req.params.key || req.query.key
    const query = req.query.query
    const website = req.query._website

    Promise.all([
      getSource(sourceName),
      new Promise((resolve, reject) => {
        try {
          resolve(JSON.parse(keyString))
        } catch (e) {
          reject(e)
        }
      })
        .catch(() => ({key: keyString}))
        .then((key) => Object.assign(key, {'arc-site': website}))
    ])
      .then(([source, key]) => source.fetch(key)
        .then(data => source.filter(query, data)))
      .then(data => { res.send(data) })
      .catch(next)
  })
  .all((req, res, next) => { res.sendStatus(405) })

contentRouter.route(['/clear', '/clear/:source', '/clear/:source/:key'])
  .post((req, res, next) => {
    const sourceName = req.params.source || req.query.source
    const keyString = req.params.key || req.query.key
    const website = req.query._website

    Promise.all([
      getSource(sourceName),
      new Promise((resolve, reject) => {
        try {
          resolve(JSON.parse(keyString))
        } catch (e) {
          reject(e)
        }
      })
        .catch(() => ({key: keyString}))
        .then((key) => Object.assign(key, {'arc-site': website}))
    ])
      .then(([source, key]) => source.clear(key))
      .then(() => { res.sendStatus(204) })
      .catch(next)
  })
  .all((req, res, next) => { res.sendStatus(405) })

contentRouter.route(['/update', '/update/:source', '/update/:source/:key'])
  .post((req, res, next) => {
    const sourceName = req.params.source || req.query.source
    const keyString = req.params.key || req.query.key
    const query = req.query.query
    const website = req.query._website

    Promise.all([
      getSource(sourceName),
      new Promise((resolve, reject) => {
        try {
          resolve(JSON.parse(keyString))
        } catch (e) {
          reject(e)
        }
      })
        .catch(() => ({key: keyString}))
        .then((key) => Object.assign(key, {'arc-site': website}))
    ])
      .then(([source, key]) => source.fetch(key, 'true')
        .then(data => source.filter(query, data)))
      .then(data => { res.send(data) })
      .catch(next)
  })
  .all((req, res, next) => { res.sendStatus(405) })

module.exports = contentRouter

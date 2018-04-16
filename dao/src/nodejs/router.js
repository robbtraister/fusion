'use strict'

const express = require('express')

const mongo = require('./mongo/schemaless')

const router = express.Router()

const queryHandler = (prep) => (req, res, next) => {
  return new Promise((resolve, reject) => {
    try {
      resolve(prep(req))
    } catch (e) {
      reject(e)
    }
  })
    .then(({environment, table, method, query, limit}) => mongo(environment).getModel(table)[method](query, limit))
    .then(data => { res.send(data) })
    .catch(next)
}

router.get('/:table', queryHandler(
  (req) => ({
    environment: req.get('ARC_ORG_ENV'),
    table: req.params.table,
    method: (req.query.limit === '1') ? 'findOne' : 'find',
    query: JSON.parse(req.query.query),
    limit: Number(req.query.limit)
  })
))

router.get('/:table/:id', queryHandler(
  (req) => ({
    environment: req.get('ARC_ORG_ENV'),
    table: req.params.table,
    method: 'findById',
    query: req.params.id
  })
))

module.exports = router

'use strict'

const express = require('express')

const router = express.Router()

router.use((req, res, next) => {
  req.arcSite = req.get('Arc-Site') || req.query._website
  next()
})

router.use(['/fuse', '/make'], require('./make'))
router.use('/resolve', require('./resolve'))

module.exports = router

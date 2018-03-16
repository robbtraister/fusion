'use strict'

const express = require('express')

const router = express.Router()

router.use('/compile', require('./compile'))
router.use('/content', require('./content'))
router.use('/engine', express.static(`${__dirname}/../../dist`))
router.use('/render', require('./render'))

module.exports = router

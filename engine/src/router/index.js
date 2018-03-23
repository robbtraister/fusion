'use strict'

const express = require('express')

const router = express.Router()

router.use('/content', require('./content'))
router.use('/render', require('./render'))
router.use('/scripts', require('./scripts'))

module.exports = router

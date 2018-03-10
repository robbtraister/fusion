'use strict'

const express = require('express')

const router = express.Router()

router.use('/resolve', require('./resolve'))

module.exports = router

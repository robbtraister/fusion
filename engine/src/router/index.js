'use strict'

const express = require('express')

const router = express.Router()

router.use('/configs', require('./configs'))
router.use('/content', require('./content'))
router.use(['/assets', '/dist'], require('./assets'))
router.use('/properties', require('./properties'))
router.use('/render', require('./render'))
router.use('/resolvers', require('./resolvers'))
router.use('/resources', require('./resources'))

module.exports = router

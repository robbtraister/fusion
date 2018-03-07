'use strict'

const mongoose = require('mongoose')

module.exports = mongoose.createConnection(process.env.MONGO_URL)

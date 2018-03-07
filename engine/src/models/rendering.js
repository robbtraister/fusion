'use strict'

const mongoose = require('mongoose')

const connection = require('./connection')

const Rendering = connection.then(c => c.model(
  'Rendering',
  new mongoose.Schema({
    _id: String
  }),
  'rendering'
))

module.exports = Rendering

if (module === require.main) {
  Rendering
    .then(model => model.findById(process.argv[2]))
    .then(console.log)
    .catch(console.error)
    .then(() => { connection.close() })
}

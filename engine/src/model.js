'use strict'

const mongoose = require('mongoose')

const connection = mongoose.createConnection(process.env.MONGO_URL)
const schema = new mongoose.Schema({_id: String})

const model = (tableName) =>
  connection.then(c => c.model(tableName, schema, tableName))

module.exports = model

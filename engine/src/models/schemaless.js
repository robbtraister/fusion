'use strict'

const url = require('url')

const MongoClient = require('mongodb').MongoClient

function Collection (db, collectionName) {
  const collectionPromise = db.then((db) => db.collection(collectionName))

  return {
    find (query) {
      return collectionPromise
        .then(collection => collection.find(query))
        .then(cursor => cursor.toArray())
    },

    get (_id) {
      return collectionPromise
        .then(collection => collection.findOne({_id}))
    }
  }
}

function Connection (mongoUrl) {
  const connectionPromise = new Promise((resolve, reject) => {
    MongoClient.connect(mongoUrl, (err, connection) => err ? reject(err) : resolve(connection))
  })

  const dbName = url.parse(mongoUrl).pathname.replace(/^\/+/, '')
  const dbPromise = connectionPromise.then((connection) => connection.db(dbName))

  return {
    collection (collectionName) {
      return Collection(dbPromise, collectionName)
    },

    close () {
      return connectionPromise.then((connection) => { connection.close() })
    }
  }
}

module.exports = Connection

if (module === require.main) {
  const connection = Connection(process.env.MONGO_URL)

  connection
    .collection(process.argv[2])
    .get(process.argv[3])
    .then(console.log)
    .catch(console.error)
    .then(() => { connection.close() })
}

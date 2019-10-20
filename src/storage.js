'use strict'

const { openDB } = require('idb')
const { kv } = require('idb-shared-kv')

module.exports = async () => {
  const db = await openDB('arswarm', 1, {
    upgrade (db, oldVersion, newVersion, transaction) {
      db.createObjectStore('txs', {
        keyPath: 'id'
      })
      db.createObjectStore('conf')

      const store = db.createObjectStore('tags', { // {key, value, tx, kv}
        keyPath: 'kv'
      })
      store.createIndex('kvTags', ['key', 'value'])
      store.createIndex('key', 'key')
      store.createIndex('value', 'value')
    }
  })

  db.kv = kv(db, 'conf')

  return db
}

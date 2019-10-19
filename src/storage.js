'use strict'

const { openDB } = require('idb')

module.exports = async () => {
  const db = await openDB('arswarm', 1, {
    async upgrade (db, oldVersion, newVersion, transaction) {
      db.createObjectStore('txs', {
        keyPath: 'id'
      })
      const store = db.createObjectStore('tags', { // {key, value, tx, kv}
        keyPath: 'kv'
      })
      store.createIndex('kvTags', ['key', 'value'])
      store.createIndex('key', 'key')
      store.createIndex('value', 'value')
    },
    blocked () {
      // …
    },
    blocking () {
      // …
    }
  })

  /* const S = {
    getTX: async (id) => {
      const data = await db.get('txs', id)

    },
    setTX: async (tx) => {

    },
    hasTX: async (tx) => {

    },
    delTX: async (id) => {

    },
    getByTag: async (tag) => {

    }
  }

  return S */

  return db
}

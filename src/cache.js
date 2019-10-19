'use strict'

const { openDB } = require('idb')

module.exports = async () => {
  const db = await openDB('arswarm', 1, {
    async upgrade (db, oldVersion, newVersion, transaction) {
      await db.createObjectStore('txs', {
        // The 'id' property of the object will be the key.
        keyPath: 'id'
      })
    },
    blocked () {
      // …
    },
    blocking () {
      // …
    }
  })
}

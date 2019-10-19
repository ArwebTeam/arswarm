'use strict'

const { openDB } = require('idb')

module.exports = async () => {
  const db = await openDB('arswarm', 1, {
    async upgrade (db, oldVersion, newVersion, transaction) {
      db.createObjectStore('txs', {
        keyPath: 'id'
      })
      db.createObjectStore('kvTags', { // {kv: '<tag>#<value>', tx: '<id>'}
        keyPath: 'kv'
      })
      db.createObjectStore('tag2tx', { // {tag: '<tag>', value: '<value>', tx: '<id>'}
        keyPath: 'tag'
      })
      db.createObjectStore('value2tx', { // {tag: '<tag>', value: '<value>', tx: '<id>'}
        keyPath: 'value'
      })
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

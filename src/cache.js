'use strict'

const Transaction = require('arweave/web/lib/transaction').default
const DB = require('./storage')

module.exports = async ({ }) => {
  const txCache = new Set()
  const db = await DB()

  const C = {
    add: async (data) => {
      if (txCache.has(data.id)) {
        return
      }

      if (db.get('txs', data.id)) {
        return
      }

      const tx = new Transaction(data)
      tx.get('tags').forEach(tag => {
        let key = tag.get('name', {decode: true, string: true})
        let value = tag.get('value', {decode: true, string: true})
        console.log(`${key} : ${value}`)
      })
      txCache.set(data.id, data)
    },
    del: async (id) => {
      if (txCache.has(id)) {
        return
      }

      txCache.delete(id)
      await storage.delTX(id)
    },
    get: async (id) => {
      if (txCache.has(id)) {
        return txCache.get(id)
      }

      if (await storage.hasTX(id)) {
        const data = await storage.getTX(id)
        const tx = new Transaction(data)
        txCache.set(id, tx)
        return tx
      }

      throw new Error('TX not found')
    }

  }
}

'use strict'

const Transaction = require('arweave/web/lib/transaction').default
const DB = require('./storage')

const ARQL = require('./arqlLocalExecutor')

module.exports = async ({ }) => {
  const txCache = new Set()
  const db = await DB()

  const C = {
    add: async (data) => {
      if (txCache.has(data.id)) {
        return
      }

      if (await db.get('txs', data.id)) {
        return
      }

      const tx = new Transaction(data)

      const dbtx = db.transaction('tags', 'readwrite')
      tx.get('tags').forEach((tag) => {
        let key = tag.get('name')
        let value = tag.get('value')

        dbtx.store.put('tags', {key, value, tx: data.id, kv: `${data.id}#${key}#${value}`})
      })
      await dbtx.done

      txCache.set(data.id, tx)
      await db.put('txs', data)
    },
    del: async (id) => {
      if (!txCache.has(id)) {
        return
      }

      const tx = txCache.get(id)
      txCache.delete(id)

      const dbtx = db.transaction('tags', 'readwrite')
      tx.get('tags').forEach((tag) => {
        let key = tag.get('name')
        let value = tag.get('value')

        dbtx.delete('tags', `${id}#${key}#${value}`)
      })
      await dbtx.done

      await db.delete('txs', tx.id)
    },
    get: async (id) => {
      if (txCache.has(id)) {
        return txCache.get(id)
      }

      let data
      if ((data = await db.get('txs', id))) {
        const tx = new Transaction(data)
        txCache.set(id, tx)
        return tx
      }

      throw new Error('TX not found')
    },
    getKVTags: async (key, value) => {
      const res = await db.getAllFromIndex('tags', 'kvTags', [key, value])
      return res.map(r => r.tx)
    },
    batchAdd: async (txs) => {
      await Promise.all(txs.map(C.add))
    },
    db
  }

  C.arql = await ARQL(C)

  return C
}

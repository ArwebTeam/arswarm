'use strict'

module.exports = (swarm, cache) => {
  return {
    arql: async (query) => {
      const newTXs = await swarm.searchForNewTransactions(query)
      await cache.batchAdd(newTXs)
      return cache.arql(query)
    },
    publish: async (tx) => {
      await cache.add(tx)
      await swarm.publishTransaction(tx)
    },
    fetch: async (id) => {
      let tx
      if ((tx = await cache.get(id))) {
        return tx
      }

      if ((tx = await swarm.fetch(id))) {
        return tx
      }

      throw new Error('TX_NOT_FOUND') // TODO: make this an arweave error
    }
  }
}

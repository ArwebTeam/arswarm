'use strict'

module.exports = (swarm, cache) => {
  return {
    arql: async (query) => {
      const newTXs = await swarm.serachForTransactions(query)
      await cache.batchAdd(newTXs)
      return cache.arql(query)
    },
    publish: async (tx) => {
      await cache.add(tx)
      await swarm.publishTransaction(tx)
    }
  }
}

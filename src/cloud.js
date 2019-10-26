'use strict'

module.exports = (swarm, cache) => {
  return {
    arql: async (query) => {
      const newTXs = await swarm.tx.searchARQL(query)
      await cache.batchAdd(newTXs)
      return cache.arql(query)
    },
    publish: async (tx) => {
      await cache.add(tx)
      await swarm.tx.publish(tx)
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
    },
    node: swarm.node,
    _swarm: swarm,
    _cache: cache
  }
}

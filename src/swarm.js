'use strict'

const Node = require('./node')

const { decodeTX, verifyTX } = require('./tx')

module.exports = async (conf, cache) => {
  const node = await Node(conf, cache)

  await prom(cb => node.pubsub.subscribe(
    'arswarm', // TODO: possibly split up networks by app-id
    async (msg) => {
      const txData = await decodeTX(msg.data)
      await verifyTX(txData)
      await cache.add(txData)
    }
  ))

  return {
    searchForNewTransactions: async (query) => {

    },
    publishTransaction: async (query) => {

    },
    fetch: async (id) => {

    }
  }
}

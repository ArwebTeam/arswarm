'use strict'

const Node = require('./node')
const prom = (f) => new Promise((resolve, reject) => f((err, res) => err ? reject(err) : resolve(res)))

const { decodeTX, encodeTX, verifyTX } = require('./tx')

module.exports = async (conf, cache) => {
  const node = await Node(conf, cache)

  await prom(cb => node.pubsub.subscribe(
    'arswarm', // IDEA: possibly split up networks by app-id
    async (msg) => {
      const txData = await decodeTX(msg.data)
      await verifyTX(txData)
      await cache.add(txData)
    },
    cb
  ))

  return {
    searchForNewTransactions: async (query) => {
      return []
    },
    publishTransaction: async (txData) => {
      const encoded = await encodeTX(txData)
      await prom(cb => node.pubsub.publish('arswarm', encoded, cb))
    },
    fetch: async (id) => {

    },
    _node: node
  }
}

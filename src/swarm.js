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
    tx: {
      searchARQL: async (query) => {
        return []
      },
      publish: async (txData) => {
        /* const encoded = await encodeTX(txData)
        await prom(cb => node.pubsub.publish('arswarm', encoded, cb)) */
      },
      fetch: async (id) => {

      }
    },
    node: {
      peer: () => {
        return {
          id: node.peerInfo.id.toB58String(),
          addrs: node.peerInfo.multiaddrs.toArray().map(String)
        }
      },
      peers: (connected) => {
        const peers = node.peerBook.getAllArray().map((p) => p.isConnected() || !connected)

        return peers.map(p => ({
          id: p.id.toB58String(),
          addr: p.multiaddrs.toArray().map(String)
        }))
      },
      connect: async (addr) => {

      }
    },
    _libp2p: node
  }
}

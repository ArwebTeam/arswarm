'use strict'

/* eslint-disable no-throw-literal */

const Node = require('./node')
const prom = (f) => new Promise((resolve, reject) => f((err, res) => err ? reject(err) : resolve(res)))

const { ARQLReq, ARQLRes, FetchReq, FetchRes, TX } = require('./proto')
const meshRPC = require('libp2p-mesh-rpc')
const { encode, decodeAndValidate, decodeRawAndValidate } = require('./tx')(TX)

function encQ (q) {
  const o = { op: q.op }

  if (typeof q.expr1 === 'string') {
    o.p1 = q.expr1
  } else if (typeof q.expr1 === 'object') {
    o.e1 = encQ(q.expr1)
  }

  if (typeof q.expr2 === 'string') {
    o.p1 = encQ()
  } else if (typeof q.expr2 === 'object') {
    o.e1 = q.expr2
  }

  return o
}

function decQ (q) {
  const o = { op: q.op }

  if (q.e1) {
    o.expr1 = decQ(q.e1)
  } else {
    q.expr1 = q.p1
  }

  if (q.e2) {
    o.expr2 = decQ(q.e2)
  } else {
    q.expr2 = q.p2
  }

  return o
}

module.exports = async (conf, cache) => {
  const node = await Node(conf, cache)
  const mesh = await meshRPC({
    swarm: node,
    protocol: '/arswarm/1.0.0',
    config: { },
    cmds: {
      arql: {
        errors: {
          401: 'Query had invalid format'
        },
        rpc: {
          request: ARQLReq,
          response: ARQLRes
        },
        handler: {
          async client (peer, send, query) { // TODO: transmit TX IDs we already have
            const res = await send({ query: encQ(query) })

            for (let i = 0; i < res.txs.length; i++) {
              res.txs[i] = await decodeRawAndValidate(res.txs[i])
            }

            return res.txs
          },
          async server (peer, { query }) { // TODO: transmit TX instead of ids, don't transmit TXs remote already has
            query = decQ(query)
            return cache.arql(query)
          }
        }
      },
      fetch: {
        errors: {
          404: 'Transaction not found'
        },
        rpc: {
          request: FetchReq,
          response: FetchRes
        },
        handler: {
          async client (peer, send, id) {
            const res = await send({ id })

            return await decodeRawAndValidate(res.tx)
          },
          async server (peer, { id }) {
            try {
              const tx = await cache.get(id)
              if (tx.isLocal) {
                throw 404
              }

              return { tx: tx.toJSON() }
            } catch (err) {
              if (err.stack && err.startsWith('Error: TX not found!')) {
                throw 404
              } else {
                throw err
              }
            }
          }
        }
      }
    }
  })

  await prom(cb => node.pubsub.subscribe(
    'arswarm', // IDEA: possibly split up networks by app-id
    async (msg) => {
      const txData = await decodeAndValidate(msg.data)
      await cache.add(txData)
    },
    cb
  ))

  return {
    tx: {
      searchARQL: async (query) => {
        // TODO: send the TXs we already have (IDs) so we only get new ones
        // TODO: also move search from cloud to swarm so we can re-use ids
        return (await mesh.cmd.arql.multicast({ successMax: 4, parallel: 5 }, query)) // this also validates. it returns TX[]
          .filter(r => r.isRes)
          .reduce((a, b) => a.concat(b.filter(b => a.indexOf(b) === -1))) // concat all results
      },
      publish: async (txData) => {
        // TODO: auto re-publish if no peers were online
        await prom(cb => node.pubsub.publish('arswarm', encode(txData), cb))
      },
      fetch: async (id) => {
        return (await mesh.cmd.fetch.multicast({ successMax: 1, parallel: 5 }, id)) // this also validates
          .filter(r => r.isRes)[0]
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
        const peers = node.peerBook.getAllArray().filter((p) => p.isConnected() || !connected)

        return peers.map(p => ({
          id: p.id.toB58String(),
          addrs: p.multiaddrs.toArray().map(String)
        }))
      },
      connect: async (addr) => {

      }
    },
    _libp2p: node
  }
}

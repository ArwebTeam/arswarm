'use strict'

const Id = require('peer-id')
const prom = (f) => new Promise((resolve, reject) => f((err, res) => err ? reject(err) : resolve(res)))

const Libp2p = require('libp2p')
const PeerInfo = require('peer-info')

const WS = require('libp2p-websockets')
const STARDUST = require('libp2p-stardust')

const UPLEX = require('uplex/libp2p')
const SPDY = require('libp2p-spdy')
const MPLEX = require('libp2p-mplex')

const SECIO = require('libp2p-secio')

const BOOTSTRAP = require('libp2p-bootstrap')

const DHT = require('libp2p-kad-dht')
const GossipSub = require('libp2p-gossipsub')

const defaultsDeep = require('@nodeutils/defaults-deep')

const DelegatedPeerRouter = require('libp2p-delegated-peer-routing')
const DelegatedContentRouter = require('libp2p-delegated-content-routing')

class Node extends Libp2p {
  // TODO: add nodetrust
  constructor (_options) {
    const peerInfo = _options.peerInfo

    const stardust = new STARDUST({ id: peerInfo.id })

    const defaults = {
      // The libp2p modules for this libp2p bundle
      modules: {
        transport: [
          stardust,
          WS
        ],
        streamMuxer: [
          UPLEX, // we can use that since WS and STARDUST handle chunking internally
          MPLEX,
          SPDY
        ],
        connEncryption: [
          SECIO
        ],
        /** Encryption for private networks. Needs additional private key to work **/
        // connProtector: new Protector(/*protector specific opts*/),
        /** Enable custom content routers, such as delegated routing **/
        // contentRouting: [
        //   new DelegatedContentRouter(peerInfo.id)
        // ],
        /** Enable custom peer routers, such as delegated routing **/
        // peerRouting: [
        //   new DelegatedPeerRouter()
        // ],
        peerDiscovery: [
          stardust.discovery,
          BOOTSTRAP
        ],
        dht: DHT, // DHT enables PeerRouting, ContentRouting and DHT itself components
        pubsub: GossipSub
      },

      // libp2p config options (typically found on a config.json)
      config: { // The config object is the part of the config that can go into a file, config.json.
        peerDiscovery: {
          autoDial: true, // Auto connect to discovered peers (limited by ConnectionManager minPeers)
          stardust: {
            interval: 1000, // ms
            enabled: true
          },
          bootstrap: {
            interval: 5000,
            enabled: true
          }
        },
        relay: { // Circuit Relay options
          enabled: true,
          hop: {
            enabled: false,
            active: false
          }
        },
        dht: {
          kBucketSize: 20,
          enabled: true,
          randomWalk: {
            enabled: true, // Allows to disable discovery (enabled by default)
            interval: 300e3,
            timeout: 10e3
          }
        },
        pubsub: {
          enabled: true,
          emitSelf: true, // whether the node should emit to self on publish, in the event of the topic being subscribed
          signMessages: true, // if messages should be signed
          strictSigning: true // if message signing should be required
        }
      }
    }

    // overload any defaults of your bundle using https://github.com/nodeutils/defaults-deep
    super(defaultsDeep(_options, defaults))
  }
}

module.exports = async ({ listen, id, bootstrap }, cache) => {
  if (!id) {
    id = await cache.db.kv.get('id')
  }

  if (!id) {
    id = await prom(cb => Id.create({ keyType: 'rsa', bits: 2048 }, cb))
    await cache.db.kv.set('id', id.toJSON())
  } else {
    id = await prom(cb => Id.createFromJSON(id, cb))
  }

  const peerInfo = new PeerInfo(id)
  listen.forEach(addr => peerInfo.multiaddrs.add(addr))

  const node = new Node({
    peerInfo,
    config: {
      peerDiscovery: {
        bootstrap: {
          list: bootstrap
        }
      }
    }
  })

  await node.start() // TODO: possibly move this somewhere else, so it doesn't crash the SW if it fails

  return node
}

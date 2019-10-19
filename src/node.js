'use strict'

const Libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const WS = require('libp2p-websockets')
const SPDY = require('libp2p-spdy')
const MPLEX = require('libp2p-mplex')
const SECIO = require('libp2p-secio')
const MulticastDNS = require('libp2p-mdns')
const DHT = require('libp2p-kad-dht')
const GossipSub = require('libp2p-gossipsub')
const defaultsDeep = require('@nodeutils/defaults-deep')
const Protector = require('libp2p-pnet')
const DelegatedPeerRouter = require('libp2p-delegated-peer-routing')
const DelegatedContentRouter = require('libp2p-delegated-content-routing')

class Node extends Libp2p {
  constructor (_options) {
    const peerInfo = _options.peerInfo
    const defaults = {
      // The libp2p modules for this libp2p bundle
      modules: {
        transport: [
          TCP,
          new WS() // It can take instances too!
        ],
        streamMuxer: [
          SPDY,
          MPLEX
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
          MulticastDNS
        ],
        dht: DHT, // DHT enables PeerRouting, ContentRouting and DHT itself components
        pubsub: GossipSub
      },

      // libp2p config options (typically found on a config.json)
      config: { // The config object is the part of the config that can go into a file, config.json.
        peerDiscovery: {
          autoDial: true, // Auto connect to discovered peers (limited by ConnectionManager minPeers)
          mdns: { // mdns options
            interval: 1000, // ms
            enabled: true
          },
          webrtcStar: { // webrtc-star options
            interval: 1000, // ms
            enabled: false
          }
          // .. other discovery module options.
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

'use strict'

/* eslint-env mocha */

const StardustServer = require('libp2p-stardust/src/server')
const Id = require('peer-id')
const Arswarm = require('..')

const addresses = ['/ip4/127.0.0.1/tcp/4444/ws/p2p-stardust']

const prom = (f) => new Promise((resolve, reject) => f((err, res) => err ? reject(err) : resolve(res)))

const fixtures = require('./fixtures.json')

describe('arswarm', () => {
  let server
  let a
  let b

  before(async () => {
    server = new StardustServer({ addresses: addresses.map(require('multiaddr')) })
    await server.start()

    const r = await Promise.all(fixtures.ids.map(async id => {
      id = await prom(cb => Id.createFromJSON(id, cb))

      return Arswarm({
        id,
        bootstrap: [],
        listen: addresses
      })
    }))

    a = r[0]
    b = r[1]
  })

  describe('exchange', () => {
    it('should exchange tx from A to B', async () => {
      await a.publish(fixtures.txs[0])
    })
  })

  after(async () => {
    await server.stop()
  })
})

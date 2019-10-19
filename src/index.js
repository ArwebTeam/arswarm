'use strict'

const Storage = require('./storage')
const Swarm = require('./swarm')
const Cache = require('./cache')
const Cloud = require('./cloud')

module.exports = async (config, arweave) => {
  const cache = await Cache(config.cache)
  const swarm = await Swarm(config.swarm, cache)

  const cloud = await Cloud(swarm, cache)

  return cloud
}

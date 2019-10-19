'use strict'

const Storage = require('./storage')
const Swarm = require('./swarm')
const Cache = require('./cache')
const Cloud = require('./cloud')

module.exports = async (config) => {
  const storage = await Storage(config.storage)

  const swarm = await Swarm(config.swarm, storage)
  const cache = await Cache(config.cache, storage)

  const cloud = await Cloud(swarm, cache)

  return cloud
}

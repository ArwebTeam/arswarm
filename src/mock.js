'use strict'

const Cache = require('./cache')

module.exports = async (config) => {
  const cache = await Cache(config.cache)

  return {
    arql: async (query) => {
      return cache.arql(query)
    },
    publish: async (tx) => {
      return cache.add(tx)
    }
  }
}

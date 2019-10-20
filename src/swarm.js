'use strict'

const Node = require('./node')

const { verifyTX } = require('./tx')

module.exports = async (conf, cache) => {
  const node = await Node(conf, cache)

  return {
    searchForNewTransactions: async (query) => {

    },
    publishTransaction: async (query) => {

    }
  }
}

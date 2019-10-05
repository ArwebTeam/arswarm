'use strict'

module.exports = (swarm) => {
  return {
    arql: (query) => {
      await swarm.serachForNewTransactions()
    }
  }
}

'use strict'

module.exports = (cache) => {
  const fncs = {
    and: async (expr1, expr2) => {
      const t1 = await interpreter(expr1)
      const t2 = await interpreter(expr2)

      return t1.filter(t => t2.indexOf(t) !== -1)
    },
    or: async (expr1, expr2) => {
      const t1 = await interpreter(expr1)
      const t2 = await interpreter(expr2)

      t2.forEach(t => {
        if (t1.indexOf(t) === -1) {
          t1.push(t)
        }
      })

      return t1
    },
    equals: async (expr1, expr2) => { // TODO: convert params to encoded format
      return cache.getKVTX(expr1, expr2)
    }
  }

  async function interpreter (q) {
    const {op, expr1, expr2} = q

    const f = fncs[op]
    return f(expr1, expr2)
  }

  // TODO: get transactions matching query from localTransactionCloud

  return async (query) => {
    return interpreter(query)
  }
}

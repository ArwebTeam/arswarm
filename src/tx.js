'use strict'

const Arweave = require('arweave/web').default
const ArweaveUtils = require('arweave/web/lib/utils')

const x = require('base-x')
const ID = x('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-')

module.exports = (TX) => {
  const arweave = Arweave.init({})

  async function validate (txData) {
    if (!await arweave.transactions.verify(arweave.transactions.fromRaw(txData))) {
      throw new Error('SIG NOK')
    }
  }

  function decode (d) {
    return decodeRaw(TX.decode(d))
  }

  function decodeRaw (d) {
    const {
      id,
      last_tx: lastTx,
      owner,
      tags,
      target,
      quantity,
      data,
      reward,
      signature
    } = d

    const o = {}

    if (id) {
      o.id = ID.encode(id)
    }

    if (lastTx) {
      o.last_tx = ID.encode(lastTx)
    }

    if (owner) {
      o.owner = owner
    }

    o.tags = tags.map(({ name, value }) => ({
      name: ArweaveUtils.bufferTob64Url(new Uint8Array(name)),
      value: ArweaveUtils.bufferTob64Url(new Uint8Array(value))
    }))

    if (quantity) {
      o.quantity = quantity
    }

    if (target) {
      o.target = target
    }

    if (data) {
      o.data = ArweaveUtils.bufferTob64Url(new Uint8Array(data))
    }

    if (reward) {
      o.reward = reward
    }

    if (signature) {
      o.signature = ArweaveUtils.bufferTob64Url(new Uint8Array(signature))
    }

    return o
  }

  function encode (tx) {
    if (tx.toJSON) {
      tx = tx.toJSON()
    }

    return TX.encode({
      id: tx.id ? ID.decode(tx.id) : null,
      last_tx: tx.last_tx ? ID.decode(tx.last_tx) : null,
      owner: tx.owner, // TODO: encode this as well
      tags: tx.tags.map(({ name, value }) => ({
        name: Buffer.from(ArweaveUtils.b64UrlToBuffer(name)),
        value: Buffer.from(ArweaveUtils.b64UrlToBuffer(value))
      })),
      target: tx.target, // TODO: encode this as well
      quantity: tx.quantity, // leave as is to prevent numbers being messed up
      data: tx.data ? Buffer.from(ArweaveUtils.b64UrlToBuffer(tx.data)) : null,
      reward: tx.reward, // leave as is to prevent numbers being messed up
      signature: tx.signature ? Buffer.from(ArweaveUtils.b64UrlToBuffer(tx.signature)) : null
    })
  }

  return {
    decodeAndValidate: async (data) => {
      const tx = decode(data)
      await validate(tx)
      return tx
    },
    decodeRawAndValidate: async (data) => {
      const tx = decodeRaw(data)
      await validate(tx)
      return tx
    },
    decode,
    decodeRaw,
    encode,
    validate
  }
}

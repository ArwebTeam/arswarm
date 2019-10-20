'use strict'

const Transaction = require('arweave/web/lib/transaction').default
const ArweaveUtils = require('arweave/web/lib/utils')
const { TX } = require('protons')(`

message TX {

}

`)

async function verifyTX (txData) {
  const transaction = await Transaction(txData)

  const signaturePayload = transaction.getSignatureData()

  /**
     * The transaction ID should be a SHA-256 hash of the raw signature bytes, so this needs
     * to be recalculated from the signature and checked against the transaction ID.
     */
  const rawSignature = transaction.get('signature', {
    decode: true,
    string: false
  })

  const expectedId = ArweaveUtils.bufferTob64Url(
    await this.crypto.hash(rawSignature)
  )

  if (transaction.id !== expectedId) {
    throw new Error(
      'Invalid transaction signature or ID! The transaction ID doesn\'t match the expected SHA-256 hash of the signature.'
    )
  }

  /**
     * Now verify the signature is valid and signed by the owner wallet (owner field = originating wallet public key).
     */
  const isOK = this.crypto.verify(
    transaction.owner,
    signaturePayload,
    rawSignature
  )

  if (!isOK) {
    throw new Error('Verify yielded NOK')
  }
}

module.exports = {
  verifyTX
}

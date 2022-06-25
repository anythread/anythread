import { Address, Bee, Reference, UploadResultWithCid, Utils } from '@ethersphere/bee-js'
import { isSwarmCid, STAMP_ID } from '../Utility'
import * as SwarmCid from '@ethersphere/swarm-cid'
import { Utils as MantarayUtils } from 'mantaray-js'
import { Wallet } from 'ethers'
import { PrefixedAddress } from '../types'

const { hexToBytes } = Utils

const { keccak256Hash } = MantarayUtils
export interface Comment {
  text: string
  timestamp: number
  /** content hash to which the message originally sent */
  contentHash: Reference
  ethAddress: PrefixedAddress
  attachment?: {
    reference: Reference
    blobType: string
  }
}

function isComment(value: unknown): value is Comment {
  return (
    value !== null &&
    typeof value === 'object' &&
    Object.keys(value).includes('text') &&
    Object.keys(value).includes('ethAddress')
  )
}

function assertComment(value: unknown): asserts value is Comment {
  if (!isComment) {
    throw new Error('The given value is not a valid user comment')
  }
}

export function deserialiseComment(value: Uint8Array): Comment {
  try {
    const valueString = new TextDecoder().decode(value)
    const valueObject = JSON.parse(valueString)
    console.log('message', valueObject)
    let message = valueObject.message

    // TODO remove it later, just it was stringified 2x
    if (typeof message === 'string') message = JSON.parse(message)

    if (!message) throw Error()

    assertComment(message)

    return message
  } catch (e) {
    throw new Error(
      `The comment is not a valid user comment on deserialization: ${new TextDecoder().decode(value)}`,
    )
  }
}

function serializeComment(message: Comment): Uint8Array {
  return new TextEncoder().encode(JSON.stringify({ message }))
}

export class UserComment {
  private contentHashBytes: Uint8Array
  constructor(private bee: Bee, contentHash: string) {
    if (Utils.isHexString(contentHash)) {
      this.contentHashBytes = Utils.hexToBytes(contentHash)
    } else if (isSwarmCid(contentHash)) {
      this.contentHashBytes = Utils.hexToBytes(SwarmCid.decodeCid(contentHash).reference)
    } else {
      this.contentHashBytes = new TextEncoder().encode(contentHash)
    }
  }

  public async fetchCommentReference(userEthAddress: Utils.EthAddress): Promise<Reference[]> {
    const topic = this.getTopic(userEthAddress)
    const feedReader = this.bee.makeFeedReader('sequence', topic, userEthAddress)
    // TODO: read out all feeds
    // but for now just the first one
    const references: Reference[] = []
    const { reference, feedIndex } = await feedReader.download()
    references.push(reference)

    // if (Number(feedIndex) > 0) {
    //   for (let nextFeedIndex = 1; nextFeedIndex < MAX_COMMENT_FROM_USER; nextFeedIndex++) {
    //     const commentIndex = (Number(feedIndex) - nextFeedIndex).toString(16).padStart(16, '0')
    //     console.log('fetch user comment', commentIndex)
    //     const feed = await feedReader.download({
    //       index: commentIndex,
    //     })
    //     console.log('feedindex', nextFeedIndex, feed)
    //     references.push(feed.reference)
    //   }
    // }

    return references
  }

  /** After writing comment the user's ethereum address has to be broadcasted */
  public async writeComment(comment: Comment, wallet: Wallet): Promise<Reference> {
    const ethAddressBytes = Uint8Array.from(hexToBytes(wallet.address.replace('0x', ''))) as Utils.Bytes<20>
    const topic = this.getTopic(ethAddressBytes)
    const feedWriter = this.bee.makeFeedWriter('sequence', topic, wallet.privateKey.replace('0x', ''))
    const commentUpload = await this.bee.uploadData(STAMP_ID, serializeComment(comment))
    await feedWriter.upload(STAMP_ID, commentUpload.reference)

    return commentUpload.reference
  }

  private getTopic(userEthAddress: Utils.EthAddress) {
    return keccak256Hash(this.contentHashBytes, userEthAddress)
  }
}

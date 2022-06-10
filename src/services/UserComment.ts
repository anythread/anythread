import { Bee, Reference, Utils } from '@ethersphere/bee-js'
import { isSwarmCid, STAMP_ID } from '../Utility'
import * as SwarmCid from '@ethersphere/swarm-cid'
import { Utils as MantarayUtils } from 'mantaray-js'
import { Wallet } from 'ethers'

const { hexToBytes } = Utils

const { keccak256Hash } = MantarayUtils
interface Comment {
  message: string
}

function isComment(value: unknown): value is Comment {
  return value !== null && typeof value === 'object' && Object.keys(value)[0] === 'message'
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
    assertComment(valueObject)

    return valueObject
  } catch (e) {
    throw new Error('The comment is not a valid user comment on deserialization')
  }
}

function serializeComment(message: Comment): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(message))
}

export default class UserComment {
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

  public async fetchCommentReference(userEthAddress: Utils.EthAddress): Promise<Reference> {
    const topic = this.getTopic(userEthAddress)
    const feedReader = this.bee.makeFeedReader('sequence', topic, userEthAddress)
    // TODO: read out all feeds
    // but for now just the first one
    const { reference } = await feedReader.download()

    return reference
  }

  /** After writing comment the user's ethereum address has to be broadcasted */
  public async writeComment(message: string, wallet: Wallet) {
    const ethAddressBytes = Uint8Array.from(hexToBytes(wallet.address.replace('0x', ''))) as Utils.Bytes<20>
    const topic = this.getTopic(ethAddressBytes)
    const feedWriter = this.bee.makeFeedWriter('sequence', topic, wallet.privateKey.replace('0x', ''))
    const commentUpload = await this.bee.uploadData(STAMP_ID, serializeComment({ message }))
    await feedWriter.upload(STAMP_ID, commentUpload.reference)
  }

  private getTopic(userEthAddress: Utils.EthAddress) {
    return keccak256Hash(this.contentHashBytes, userEthAddress)
  }
}

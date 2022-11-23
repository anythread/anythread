import { Bee, Utils, Reference } from '@fairdatasociety/bee-js'
import { Bytes } from 'mantaray-js'
import { getEthereumAddress, HexEthAddress } from '../Utility'
import { stampPicker } from './StampPicker'

interface DbRecord {
  ethAddresses: HexEthAddress[]
}

function isGraffitiFeedElement(value: unknown): value is DbRecord {
  return value !== null && typeof value === 'object' && Object.keys(value)[0] === 'ethAddresses'
}

function assertGraffitiFeedElement(value: unknown): asserts value is DbRecord {
  if (!isGraffitiFeedElement(value)) {
    throw new Error('GraffitiFeed record is not valid')
  }
}

function deserialiseDbRecord(value: Uint8Array): DbRecord {
  try {
    const valueString = new TextDecoder().decode(value)
    const valueObject = JSON.parse(valueString)
    assertGraffitiFeedElement(valueObject)

    return valueObject
  } catch (e) {
    throw new Error('fetched GraffitiFeed record is not valid')
  }
}

function serializeDbRecord(updateElement: DbRecord): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(updateElement))
}

function mergeRecords(e1: DbRecord, e2: DbRecord): DbRecord {
  const e2EthAddresses = e2.ethAddresses.filter(e => !e1.ethAddresses.includes(e))

  return { ethAddresses: [...e1.ethAddresses, ...e2EthAddresses] }
}

export default class GraffitiFeed {
  constructor(private bee: Bee, private privateKey: Bytes<32>, private topic: Bytes<32>) {}

  public async broadcastEthAddresses(ethAddresses: Utils.EthAddress[]): Promise<Reference> {
    const myUpdate = this.buildUpdate(ethAddresses)
    const lastUpdate = await this.getLatestRecord()
    const update = lastUpdate ? mergeRecords(lastUpdate, myUpdate) : myUpdate
    const feedWriter = this.bee.makeFeedWriter('sequence', this.topic, this.privateKey)
    const { reference } = await this.bee.uploadData(stampPicker.batchId, serializeDbRecord(update))
    console.log('uploaded swarm reference of the eth address broadcast', reference)

    return feedWriter.upload(stampPicker.batchId, reference)
  }

  public async getLatestRecord(): Promise<DbRecord | null> {
    const feedReader = this.bee.makeFeedReader('sequence', this.topic, getEthereumAddress(this.privateKey))
    try {
      const feedUpdate = await feedReader.download()
      const data = await this.bee.downloadData(feedUpdate.reference)

      return deserialiseDbRecord(data)
    } catch (e) {
      console.error('error happened at getLastRecord fetch', e)

      return null
    }
  }

  private buildUpdate(addresses: Utils.EthAddress[]): DbRecord {
    const ethAddresses = addresses.map(address => Utils.bytesToHex(address, 40))

    return { ethAddresses }
  }
}

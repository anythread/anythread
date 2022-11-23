import { BatchId, BeeDebug } from '@fairdatasociety/bee-js'
import { swarmExtensionIsAvailable } from '../Utility'

/**
 * Gets usable batch id
 */
async function getUsableBatch(): Promise<BatchId> {
  const beeDebug = new BeeDebug('http://localhost:1635')
  const allBatch = await beeDebug.getAllPostageBatch()

  const result = allBatch.find(item => item.usable)

  if (!result) {
    throw new Error('Usable batch not found')
  }

  return result.batchID
}

class StampPicker {
  batchId = '0000000000000000000000000000000000000000000000000000000000000000'
  hasSwarmExtension = false
  noBatch = false

  constructor() {
    this.asyncInit()
  }

  private async asyncInit() {
    this.hasSwarmExtension = await swarmExtensionIsAvailable()

    // choose postage stamp
    if (!this.hasSwarmExtension) {
      try {
        this.batchId = await getUsableBatch()
      } catch (e) {
        this.noBatch = true
      }
    }
  }
}

export const stampPicker = new StampPicker()

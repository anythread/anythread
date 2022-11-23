import { Utils as BeeJsUtils } from '@fairdatasociety/bee-js'
import { Utils as MantarayUtils } from 'mantaray-js'
import * as SwarmCid from '@ethersphere/swarm-cid'
import { Bytes } from '@fairdatasociety/bee-js/dist/types/utils/bytes'
import { Wallet } from 'ethers'
import { Swarm } from '@ethersphere/swarm-extension'

/** Used as a rootThreat topic */
export const VERSION_HASH = MantarayUtils.keccak256Hash('633chan:v1')

export const swarm = new Swarm('afpgelfcknfbbfnipnomfdbbnbbemnia')

export type HexEthAddress = BeeJsUtils.HexString<40>

export function swarmExtensionIsAvailable(): Promise<boolean> {
  try {
    return new Promise(async resolve => {
      setTimeout(() => {
        resolve(false)
      }, 1500)
      const resp = await swarm.echo('echo')
      resolve(resp === 'echo')
    })
  } catch (e) {
    return Promise.resolve(false)
  }
}

export function isSwarmCid(input: string): boolean {
  // FIXME: after https://github.com/ethersphere/swarm-cid-js/issues/7
  try {
    SwarmCid.decodeFeedCid(input)

    return true
  } catch (e) {
    try {
      SwarmCid.decodeManifestCid(input)

      return true
    } catch (e) {
      return false
    }
  }
}

export function getEthereumAddress(privateKey: Bytes<32>): string {
  const wallet = new Wallet(privateKey)

  return wallet.address
}

export type BlobType = string | 'folder'

export function getBlobType(files: FileList): BlobType {
  if (files.length > 1) return 'folder'

  if (files.length === 0) throw Error(`no file has been added`)

  return files[0].type
}

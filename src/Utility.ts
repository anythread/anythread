import { Utils as BeeJsUtils } from '@ethersphere/bee-js'
import { Utils as MantarayUtils } from 'mantaray-js'
import * as SwarmCid from '@ethersphere/swarm-cid'

/** Used as a rootThreat topic */
export const VERSION_HASH = MantarayUtils.keccak256Hash('633chan:v1')

/** Handled by the gateway proxy or swarm-extension */
export const STAMP_ID = '0000000000000000000000000000000000000000000000000000000000000000'

export type HexEthAddress = BeeJsUtils.HexString<40>

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

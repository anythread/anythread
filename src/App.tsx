import './App.css'
import { useEffect } from 'react'
import { useState } from 'react'
import Thread from './Thread'
import { Bee, Utils } from '@ethersphere/bee-js'
import { Wallet } from 'ethers'
import { HexString } from '@ethersphere/bee-js/dist/types/utils/hex'

const { hexToBytes } = Utils

const sanitizeContentHash = (): HexString<64> => {
  console.log('hashchange', window.location.hash)
  let hash = window.location.hash.slice(1)

  if (hash.startsWith('0x')) {
    hash = hash.slice(2)
  }

  if (!Utils.isHexString(hash, 64)) {
    hash = Utils.bytesToHex(Utils.keccak256Hash(hash))
  }

  return hash as HexString<64>
}

/** max fetched posts on one level */
const DEFAULT_MAX_THREAD_COUNT = 3

function App() {
  const [contentHash, setContentHash] = useState(sanitizeContentHash())
  const [bee, setBee] = useState(new Bee('http://localhost:1633'))
  const [loadingThreadId, setLoadingThreadId] = useState<[number, number]>([0, 0])
  const [wallet, setWallet] = useState(Wallet.createRandom())

  // constructor
  useEffect(() => {
    const valami = () => {
      console.log('hashchange1', window.location.hash)
      const hash = sanitizeContentHash()
      setContentHash(hash)
    }
    window.addEventListener('hashchange', valami)

    /** bytes represent hex keys */
    const setByteKey = (keyBytes: Uint8Array) => {
      const wallet = new Wallet(keyBytes)
      setWallet(wallet)
    }

    const setStringKey = (key: string) => {
      const keyBytes = Utils.hexToBytes(key)
      setByteKey(keyBytes)
    }

    // bee init
    if (window.swarm && window.origin === 'null') {
      const beeUrl = window.swarm.web2Helper.fakeBeeApiAddress()
      setBee(new Bee(beeUrl))
      ;(async () => {
        //private key handling
        const windowPrivKey = await window.swarm.localStorage.getItem('private_key')

        if (windowPrivKey) {
          setStringKey(windowPrivKey)
        } else {
          const key = wallet.privateKey.replace('0x', '')
          await window.swarm.localStorage.setItem('private_key', key)
        }
      })()
    } else {
      // key init
      const windowPrivKey = window.localStorage.getItem('private_key')

      if (windowPrivKey) {
        setStringKey(windowPrivKey)
      } else {
        const key = hexToBytes(wallet.privateKey.replace('0x', ''))
        window.localStorage.setItem('private_key', Utils.bytesToHex(key))
        setByteKey(key)
      }
    }
  }, [])

  const initChildrenDoneFn = (level: number, orderNo: number) => {
    console.log(`level ${level} with orderNo ${orderNo} has been inited its children!`)

    //TODO: fetch other threads

    if (orderNo === DEFAULT_MAX_THREAD_COUNT) {
      level++
      orderNo = 0
    }

    if (level === DEFAULT_MAX_THREAD_COUNT && orderNo === DEFAULT_MAX_THREAD_COUNT) {
      return
    }

    console.log('még mindig nyommom loadingThreadId', level, orderNo)

    if (orderNo < DEFAULT_MAX_THREAD_COUNT) {
      setLoadingThreadId([level, orderNo + 1])
    } else if (level < DEFAULT_MAX_THREAD_COUNT) {
      setLoadingThreadId([level + 1, orderNo])
    }
  }

  const initDoneFn = (level: number, orderNo: number) => {
    console.log(`level ${level} with orderNo ${orderNo} has been inited!`)
    //TODO: register threads for init their children later
  }

  return (
    <div className="App">
      <h2>AnyThread</h2>
      <div className="anythread-body">
        <Thread
          bee={bee}
          contentHash={contentHash}
          level={0}
          orderNo={0}
          loadingThreadId={loadingThreadId}
          initChildrenDoneFn={initChildrenDoneFn}
          initDoneFn={initDoneFn}
          wallet={wallet}
        />
      </div>
    </div>
  )
}

export default App

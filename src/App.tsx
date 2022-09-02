import './App.css'
import React, { useEffect } from 'react'
import { useState } from 'react'
import Thread from './Thread'
import Embed from './Embed'
import { Bee, Utils } from '@ethersphere/bee-js'
import { Wallet } from 'ethers'
import { HexString } from '@ethersphere/bee-js/dist/types/utils/hex'
import { HAS_SWARM_EXTENSION } from './Utility'

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
const BEE_API_URL = HAS_SWARM_EXTENSION ? window.swarm.web2Helper.fakeBeeApiAddress() : 'localhost:1633/'

function App() {
  const [contentHash, setContentHash] = useState(sanitizeContentHash())
  const [bee, setBee] = useState(new Bee(BEE_API_URL))
  const [loadingThreadId, setLoadingThreadId] = useState<[number, number]>([0, 0])
  const [wallet, setWallet] = useState(Wallet.createRandom())
  const [locationText, setLocationText] = useState('')
  const [embedUrl, setEmbedUrl] = useState('')

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
    if (HAS_SWARM_EXTENSION) {
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
      // init key
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

  const goHome = () => {
    window.location.href = window.location.href.split('#')[0]
  }

  const handleNavigation = () => {
    const locationLength = locationText.length

    console.log('ismét nyommom loadingLoc', locationText)

    if (Utils.isHexString(locationText)) {
      window.location.hash = locationText
    } else {
      window.location.hash = Utils.bytesToHex(Utils.keccak256Hash(locationText))
    }
    const objectUrl = getEmbedUrl(locationText)
    setEmbedUrl(objectUrl)

    console.log('ismét nyommom gotLoc', objectUrl)
  }

  const getEmbedUrl = (loc: string) => {
    let obj

    if (Utils.isHexString(locationText)) {
      obj = BEE_API_URL + '/bzz/' + loc

      setEmbedUrl(obj)
    } else {
      obj = loc
      setEmbedUrl(obj)
    }

    return obj
  }

  return (
    <div className="App">
      <h1 onClick={goHome} style={{ cursor: 'pointer' }}>
        AnyThread
      </h1>
      <div className="navigation">
        <form onSubmit={handleNavigation}>
          <input type="text" value={locationText} onChange={e => setLocationText(e.target.value)} />
          <input className="btn" type="submit" value="Go" />
        </form>
      </div>
      <Embed data={embedUrl} />
      <div className="anythread-body">
        <div id="user" style={{ marginBottom: 12, fontStyle: 'oblique' }}>
          Your user address is: {wallet.address}
        </div>
        <Thread
          key={contentHash}
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
      <div style={{ paddingTop: 24 }}>
        <div hidden={HAS_SWARM_EXTENSION}>
          You are using now a gateway to reach P2P storage.
          <br />
          Please run <a href="https://docs.ethswarm.org/docs/installation/quick-start">Bee client</a> and{' '}
          <a href="https://chrome.google.com/webstore/detail/ethereum-swarm-extension/afpgelfcknfbbfnipnomfdbbnbbemnia">
            Swarm Extension
          </a>{' '}
          after the gateway is disfunctional for traceless communication
        </div>
        <br />
        <a href="https://github.com/anythread/anythread">Source</a>
      </div>
    </div>
  )
}

export default App

import './App.css'
import React, { useEffect } from 'react'
import { useState } from 'react'
import Thread from './Thread'
import { Bee, Utils } from '@fairdatasociety/bee-js'
import { Wallet } from 'ethers'
import { HexString } from '@fairdatasociety/bee-js/dist/types/utils/hex'
import { Swarm } from '@ethersphere/swarm-extension'

const swarm = new Swarm('icoingfkhimajdejcipondccliimpgjb')

const { hexToBytes } = Utils

const sanitizeContentHash = (): HexString<64> => {
  let hash = window.location.hash.slice(1)

  if (hash.startsWith('0x')) {
    hash = hash.slice(2)
  }

  if (!Utils.isHexString(hash, 64)) {
    hash = Utils.bytesToHex(Utils.keccak256Hash(hash))
  }

  return hash as HexString<64>
}

const DEFAULT_BEE_API_URL = 'http://localhost:1633/'

function App() {
  const [contentHash, setContentHash] = useState(sanitizeContentHash())
  const [bee, setBee] = useState(new Bee(DEFAULT_BEE_API_URL))
  const [hasSwarmExtension, setHasSwarmExtension] = useState(false)
  const [wallet, setWallet] = useState(Wallet.createRandom())
  const [asyncInited, setAsyncInited] = useState(false)

  // constructor
  useEffect(() => {
    const valami = () => {
      console.log('hashchange1', window.location.hash)
      const hash = sanitizeContentHash()
      setContentHash(hash)
    }
    window.addEventListener('hashchange', valami)

    asyncInit()
  }, [])

  useEffect(() => {
    if (!asyncInited) return
    console.log('Initing swarm extension', hasSwarmExtension)
    /** bytes represent hex keys */
    const setByteKey = (keyBytes: Uint8Array) => {
      const wallet = new Wallet(keyBytes)
      setWallet(wallet)
    }

    const setStringKey = (key: string) => {
      const keyBytes = Utils.hexToBytes(key)
      setByteKey(keyBytes)
    }

    if (hasSwarmExtension) {
      ;(async () => {
        await swarm.register()
        //private key handling
        const windowPrivKey = (await swarm.localStorage.getItem('private_key')) as string

        if (windowPrivKey) {
          setStringKey(windowPrivKey)
        } else {
          const key = wallet.privateKey.replace('0x', '')
          await swarm.localStorage.setItem('private_key', key)
        }

        // init Bee
        setBee(new Bee(swarm.web2Helper.fakeBeeApiAddress()))
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

      // init Bee
      setBee(new Bee(DEFAULT_BEE_API_URL))
    }
  }, [hasSwarmExtension])

  const asyncInit = async () => {
    // trigger hasSwarmExtension
    try {
      await swarm.echo('echo')
      setHasSwarmExtension(true)
    } catch (e) {
      console.log('Swarm Extension is not available')
    }
    setAsyncInited(true)
  }

  const goHome = () => {
    window.location.href = window.location.href.split('#')[0]
  }

  return (
    <div className="App">
      <h1 onClick={goHome} style={{ cursor: 'pointer' }}>
        AnyThread
      </h1>
      <div className="anythread-body">
        <div id="user" style={{ marginBottom: 12, fontStyle: 'oblique' }}>
          Your user address is: {wallet.address}
        </div>
        <Thread key={contentHash} bee={bee} contentHash={contentHash} level={0} orderNo={0} wallet={wallet} />
      </div>
      <div style={{ paddingTop: 24 }}>
        <div hidden={hasSwarmExtension}>
          You are using now your localhost to reach P2P storage network.
          <br />
          Please install
          <a href="https://chrome.google.com/webstore/detail/ethereum-swarm-extension/afpgelfcknfbbfnipnomfdbbnbbemnia">
            Swarm Extension
          </a>{' '}
          in order to use AnyThread with non-local Bee-client and with the same profile.
        </div>
        <br />
        <a href="https://github.com/anythread/anythread">Source</a>
      </div>
    </div>
  )
}

export default App

import './App.css'
import { useEffect } from 'react'
import { useState } from 'react'
import Thread from './Thread'
import Home from './Home'
import { Bee, Utils } from '@ethersphere/bee-js'
import { Wallet } from 'ethers'
import { HexString } from '@ethersphere/bee-js/dist/types/utils/hex'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

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

function App() {
  const [contentHash, setContentHash] = useState(sanitizeContentHash())
  const [bee, setBee] = useState(new Bee('http://localhost:1633'))
  //const [bee, setBee] = useState(new Bee('https://gateway.fairdatasociety.org/bzz'))
  //const [bee, setBee] = useState(new Bee('https://gateway.ethswarm.org/bzz'))
  const [loadingThreadId, setLoadingThreadId] = useState<[number, number]>([0, 0])
  const [wallet, setWallet] = useState(Wallet.createRandom())

  useEffect(() => {
    const valami = () => {
      console.log('hashchange1', window.location.hash)
      const hash = sanitizeContentHash()
      setContentHash(hash)
    }
    window.addEventListener('hashchange', valami)

    // key init
    const setStringKey = (key: string) => {
      const keyBytes = Utils.hexToBytes(key)
      setByteKey(keyBytes)
    }

    /** bytes represent hex keys */
    const setByteKey = (keyBytes: Uint8Array) => {
      const wallet = new Wallet(keyBytes)
      setWallet(wallet)
    }

    const windowPrivKey = window.localStorage.getItem('private_key')

    if (windowPrivKey) {
      setStringKey(windowPrivKey)
    } else {
      const key = hexToBytes(wallet.privateKey.replace('0x', ''))
      window.localStorage.setItem('private_key', Utils.bytesToHex(key))
      setByteKey(key)
    }
  }, [])

  const initChildrenDoneFn = (level: number, orderNo: number) => {
    console.log(`level ${level} with orderNo ${orderNo} has been inited its children!`)
    //TODO: fetch other threads
  }

  const initDoneFn = (level: number, orderNo: number) => {
    console.log(`level ${level} with orderNo ${orderNo} has been inited!`)
    //TODO: register threads for init their children later
  }

  return (
    <Router> 
      <div className="App"> 
        <h1>AnyThread</h1>
        <div className="anythread-body">
          <Routes>
            <Route path="/" element={<Home wallet={wallet} bee={bee} />} />
            <Route
              path="/:topic"
              element={
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
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App

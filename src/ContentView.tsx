import { useState } from 'react'
import { useEffect } from 'react'
import { ReactElement } from 'react'
import * as SwarmCid from '@ethersphere/swarm-cid'
import { Bee, Utils } from '@ethersphere/bee-js'

interface Props {
  contentHash: string
  bee: Bee
  level: number
}

function getBzzLink(contentHash: string): string {
  try {
    const cid = SwarmCid.encodeReference(contentHash, SwarmCid.ReferenceType.FEED)

    return `https://${cid}.bzz.link`
  } catch (e) {
    return `https://${contentHash}.bzz.link`
  }
}

export default function ContentView({ contentHash, bee, level }: Props): ReactElement {
  const [bzzLink, setBzzLink] = useState('')
  const [text, setText] = useState('')
  const [timestamp, setTimestamp] = useState('')
  const [hash, setHash] = useState('')
  const [ethAddress, setEthAddress] = useState('0x')

  useEffect(() => {
    setBzzLink(getBzzLink(contentHash))
    bee.downloadData(contentHash).then(data => {
      const jsonString = new TextDecoder().decode(data)
      const post = JSON.parse(JSON.parse(jsonString).message) // this is bad as its double encoded, content at contentHash is 2x json

      setText(post.text)
      setTimestamp(post.timestamp)
      setHash(post.contentHash)
      setEthAddress(post.ethAddress)
      console.log('data', data, jsonString, post, timestamp)
    })
    console.log('contentHash', contentHash)
  }, [contentHash])

  const handleView = () => {
    window.location.hash = contentHash
  }

  return (
    <div id={contentHash} className="anythread-comment">
      <div>
        <h2>{text}</h2>
        <div className="anythread-comment-name">
          <a className="clickable" onClick={handleView}>
            View
          </a>
          <a href={bzzLink}>BZZ link</a>{' '}
        </div>
        <div className="anythread-comment-date">{new Date(Number(timestamp)).toDateString()}</div>
        <div className="anythread-comment-address">{ethAddress}🦄</div>
        {/* <div className="anythread-comment-content">{hash}</div> */}
      </div>
    </div>
  )
}

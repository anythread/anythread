import { useState } from 'react'
import { useEffect } from 'react'
import { ReactElement } from 'react'
import * as SwarmCid from '@ethersphere/swarm-cid'
import { Bee, Utils } from '@ethersphere/bee-js'
import ReactTooltip from 'react-tooltip'

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
  const [parentHash, setParentHash] = useState('')
  const [ethAddress, setEthAddress] = useState('0x')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setBzzLink(getBzzLink(contentHash))

    bee.downloadData(contentHash).then(data => {
      const jsonString = new TextDecoder().decode(data)
      const post = JSON.parse(JSON.parse(jsonString).message) // this is bad as its double encoded, content at contentHash is 2x json

      setText(post.text)
      setTimestamp(post.timestamp)
      setParentHash(post.contentHash)
      setEthAddress(post.ethAddress)
      //console.log('data', data, jsonString, post, timestamp)
      setLoading(false)
    })
    console.log('content hash', contentHash)
  }, [contentHash])

  const handleView = () => {
    window.location.hash = contentHash
    console.log('goto', contentHash)
  }
  const gotoRef = () => {
    window.location.hash = parentHash
    console.log('goto', parentHash)
  }

  return (
    <div id={contentHash} className="anythread-comment">
      {ethAddress === '0x' ? (
        <h2>ROOTOPIC</h2>
      ) : (
        <div>
          {/* {parentHash} */}
          {loading ? <div className="loader"></div> : null}
          <h2
            onClick={handleView}
            style={{ cursor: 'pointer' }}
            data-tip={'go to Topic ' + contentHash}
            className="anythread-comment-title"
          >
            {text}
          </h2>

          <div className="anythread-comment-name">
            {/* <a className="clickable" onClick={handleView}>
            View
          </a> */}
            {/* <a href={bzzLink}>BZZ link</a>{' '} */}
          </div>
          {/* {contentHash} */}
          <div
            id="parentHash"
            onClick={gotoRef}
            className="anythread-comment-name"
            style={{ cursor: 'pointer' }}
            data-tip={'go to parent ' + parentHash}
          >
            ⇑
          </div>

          <div className="anythread-comment-date">
            {new Date(Number(timestamp)).toDateString()} &nbsp;
            <span data-tip={'sender ' + ethAddress}>🦄</span>&nbsp;
            <a className="clickable" onClick={handleView}>
              View
            </a>
          </div>

          {/* <div className="anythread-comment-address" data-tip={'sender ' + ethAddress}>
            🦄
          </div> */}
        </div>
      )}
      <ReactTooltip effect="solid" backgroundColor="#1b1216" textColor="#ffdae8" />
    </div>
  )
}

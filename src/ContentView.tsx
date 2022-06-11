import { useState } from 'react'
import { useEffect } from 'react'
import { ReactElement } from 'react'
import * as SwarmCid from '@ethersphere/swarm-cid'
import { Bee, Utils } from '@ethersphere/bee-js'

interface Props {
  contentHash: string
  bee: Bee
}

function getBzzLink(contentHash: string): string {
  try {
    const cid = SwarmCid.encodeReference(contentHash, SwarmCid.ReferenceType.FEED)

    return `https://${cid}.bzz.link`
  } catch (e) {
    return `https://${contentHash}.bzz.link`
  }
}

export default function ContentView({ contentHash, bee }: Props): ReactElement {
  const [bzzLink, setBzzLink] = useState('')
  const [text, setText] = useState('')
  const [timestamp, setTimestamp] = useState('')
  const [hash, setHash] = useState('')

  useEffect(() => {
    setBzzLink(getBzzLink(contentHash))
    bee.downloadData(contentHash).then(data => {
      const jsonString = new TextDecoder().decode(data)
      const post = JSON.parse(JSON.parse(jsonString).message) // this is bad as its double encoded, content at contentHash is 2x json

      setText(post.text)
      setTimestamp(post.timestamp)
      setHash(post.contentHash)
      const date = new Date(timestamp).toDateString()
      console.log('data', data, jsonString, post, date)
    })
    console.log('contentHash', contentHash)
  }, [contentHash])

  return (
    <div id={contentHash} className="anythread-comment">
      <div>
        <h2>{text}</h2>
        <div className="anythread-comment-name">
          <a href={bzzLink}>BZZ link</a> <a href={'/#' + contentHash}>Content</a>
        </div>
        <div className="anythread-comment-timestamp">{timestamp}</div>
        {/* <div className="anythread-comment-content">{hash}</div> */}
      </div>
    </div>
  )
}

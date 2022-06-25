import { useState } from 'react'
import { useEffect } from 'react'
import { ReactElement } from 'react'
import * as SwarmCid from '@ethersphere/swarm-cid'
import { Bee, Reference } from '@ethersphere/bee-js'
import { deserialiseComment } from './services/UserComment'
import { BlobType } from './Utility'

interface Props {
  contentHash: string
  bee: Bee
  level: number
}

function getBzzLink(contentHash: string): string {
  const cid = SwarmCid.encodeReference(contentHash, SwarmCid.ReferenceType.FEED)

  return `https://${cid}.bzz.link`
}

function renderAttachment(blobType: BlobType | null, contentAddress: Reference | null): ReactElement {
  if (blobType === null || contentAddress === null) return <></>
  const contentType = blobType.split('/')[0]
  const bzzLink = getBzzLink(contentAddress)

  switch (contentType) {
    case 'image':
      return (
        <a href={bzzLink}>
          <img is="swarm-img" style={{ maxWidth: '80%', maxHeight: 3000 }} src={bzzLink}></img>
        </a>
      )
    default:
      return <a href={bzzLink}>Open Attachement</a>
  }
}

export default function ContentView({ contentHash, bee, level }: Props): ReactElement {
  const [text, setText] = useState('')
  const [timestamp, setTimestamp] = useState(-416202389)
  const [parentHash, setParentHash] = useState('')
  const [ethAddress, setEthAddress] = useState('0x')
  const [attachmentBlobType, setAttachmentBlobType] = useState<null | BlobType>(null)
  const [attachmentReference, setAttachmentReference] = useState<null | Reference>(null)

  useEffect(() => {
    bee.downloadData(contentHash).then(data => {
      const post = deserialiseComment(data)

      setText(post.text)
      setTimestamp(post.timestamp)
      setParentHash(post.contentHash)
      setEthAddress(post.ethAddress)
      setAttachmentBlobType(post.attachment?.blobType || null)
      setAttachmentReference(post.attachment?.reference || null)

      console.log('data', post)
    })
    console.log('contentHash', contentHash)
  }, [contentHash])

  const handleView = () => {
    window.location.hash = contentHash
  }

  return (
    <div id={contentHash} className="anythread-comment">
      {ethAddress === '0x' ? (
        <h2>ROOTOPIC</h2>
      ) : (
        <div>
          <h2 onClick={handleView} style={{ cursor: 'pointer' }}>
            {text}
          </h2>
          <div hidden={!attachmentBlobType}>{renderAttachment(attachmentBlobType, attachmentReference)}</div>
          <div className="anythread-comment-date">
            {new Date(Number(timestamp)).toDateString()} &nbsp;
            <a className="clickable" onClick={handleView}>
              View
            </a>
          </div>
          <div className="anythread-comment-address">{ethAddress}🦄</div>
          {/* <div className="anythread-comment-content">{hash}</div> */}
        </div>
      )}
    </div>
  )
}

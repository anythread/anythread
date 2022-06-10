import { useState } from 'react'
import { useEffect } from 'react'
import { ReactElement } from 'react'
import * as SwarmCid from '@ethersphere/swarm-cid'

interface Props {
  contentHash: string
}

function getBzzLink(contentHash: string): string {
  try {
    const cid = SwarmCid.encodeReference(contentHash, SwarmCid.ReferenceType.FEED)

    return `https://${cid}.bzz.link`
  } catch (e) {
    return `https://${contentHash}.bzz.link`
  }
}

export default function ContentView({ contentHash }: Props): ReactElement {
  const [bzzLink, setBzzLink] = useState('')

  useEffect(() => {
    setBzzLink(getBzzLink(contentHash))
  }, [contentHash])

  return (
    <div id={contentHash}>
      <div>Content address: {contentHash}</div>
      <div>
        Your content cannot be display here.
        <br />
        Please follow the BZZ link to get the file <br />
        BZZ link: <a href={bzzLink}>{bzzLink}</a>
      </div>
    </div>
  )
}

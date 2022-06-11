import { Bee, Utils } from '@ethersphere/bee-js'
import { Wallet } from 'ethers'
import { FormEvent, ReactElement, useState } from 'react'
import { useEffect } from 'react'
import ContentView from './ContentView'
import GraffitiFeed from './services/GraffitiFeed'
import UserComment from './services/UserComment'
import { VERSION_HASH } from './Utility'
const { hexToBytes } = Utils

const DEFAULT_CHILDREN_COUNT = 5

interface Props {
  contentHash: string // -> GraffitiFeed get users + content fetch
  level: number
  orderNo: number
  loadingThreadId: [number, number]
  bee: Bee
  initChildrenDoneFn: (level: number, orderNo: number) => void
  initDoneFn: (level: number, ordnerNo: number) => void
  /** For writing direct comments */
  wallet: Wallet
}

export default function Thread({
  contentHash,
  level,
  orderNo,
  loadingThreadId,
  bee,
  initChildrenDoneFn,
  initDoneFn,
  wallet,
}: Props) {
  const graffitiFeed = new GraffitiFeed(bee, Utils.hexToBytes(contentHash), VERSION_HASH)
  const [childrenElements, setChildrenElements] = useState<ReactElement[]>([])
  const [commentText, setCommentText] = useState('')

  useEffect(() => {
    initDoneFn(level, orderNo)
  }, [])

  useEffect(() => {
    if (loadingThreadId[0] === level && loadingThreadId[1] === orderNo) {
      // init Children Thread elements
      initChildren()
    }
    // if -1, -1, then set loading more and comment section
  }, [loadingThreadId])

  const initChildren = async () => {
    const record = await graffitiFeed.getLatestRecord()

    console.log('records', record)

    if (!record) {
      initChildrenDoneFn(level, orderNo) //children has

      return
    }
    const ethAddresses = record.ethAddresses.map(e => hexToBytes(e)).reverse() // most recent comment is the first index
    const userComment = new UserComment(bee, contentHash)
    const commentThreads: ReactElement[] = []
    for (const [index, ethAddress] of Object.entries(ethAddresses)) {
      const contentHashes = await userComment.fetchCommentReference(Utils.makeEthAddress(ethAddress))

      // TODO only push the freshest message
      commentThreads.push(
        <Thread
          key={`${level + 1}-${Number(index)}`}
          contentHash={contentHashes[0]}
          level={level + 1}
          orderNo={Number(index)}
          bee={bee}
          initChildrenDoneFn={initChildrenDoneFn}
          loadingThreadId={loadingThreadId}
          initDoneFn={initDoneFn}
          wallet={wallet}
        />,
      )
      console.log('setChildren', commentThreads)
      setChildrenElements([...childrenElements, ...commentThreads])
    }
    initChildrenDoneFn(level, orderNo)
  }

  const handleSendComment = async (e: FormEvent) => {
    e.preventDefault()
    const userComment = new UserComment(bee, contentHash)
    // todo
    const post = {
      text: commentText,
      timestamp: Date.now(),
      contentHash: contentHash,
    }
    const data = JSON.stringify(post)
    await userComment.writeComment(data, wallet)
    await graffitiFeed.broadcastEthAddresses([Utils.makeEthAddress(wallet.address.replace('0x', ''))])
  }

  return (
    <div>
      <ContentView contentHash={contentHash} bee={bee} />
      <div children={childrenElements}></div>

      <div className="write-comment">
        <form onSubmit={handleSendComment}>
          <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)} />
          <input type="submit" value="Submit" />
        </form>
      </div>
    </div>
  )
}

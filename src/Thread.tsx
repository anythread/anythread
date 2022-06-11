import { Bee, Utils } from '@ethersphere/bee-js'
import { Wallet } from 'ethers'
import { FormEvent, ReactElement, useState } from 'react'
import { useEffect } from 'react'
import ContentView from './ContentView'
import PublicPirateDb from './services/PublicPirateDb'
import UserComment from './services/UserComment'
import { VERSION_HASH } from './Utility'
import Comment from './Comment'
const { hexToBytes } = Utils

const DEFAULT_CHILDREN_COUNT = 5

type Comment = {
  timestamp: string
  description: string
  topic: string
  //Comment: []
}
const comments: Comment[] = [
  { description: 'comment 1 some really long long long stuff ', topic: 'topic 1', timestamp: '2020-01-01' },
  {
    description:
      'comment 5 we will see it this works and then http://localhost:1633 be cake fhaosihd doasidofh aodf haosdfahdo ihaosdfihaosdifoia hofih ofaihd odafh oasihdf oasdhif oiasdho fihadso ihafoihaosdfhoasdih oaisf h',
    topic: 'topic 5',
    timestamp: '2020-01-05',
  },
  { description: 'comment 3', topic: 'topic 3', timestamp: '2020-01-03' },
  { description: 'comment 4', topic: 'topic 4', timestamp: '2020-01-04' },
  { description: 'comment 5', topic: 'topic 5', timestamp: '2020-01-05' },
  { description: 'comment 6', topic: 'topic 6', timestamp: '2020-01-06' },
  { description: 'comment 7', topic: 'topic 7', timestamp: '2020-01-07' },
  { description: 'comment 8', topic: 'topic 8', timestamp: '2020-01-08' },
  { description: 'comment 1', topic: 'topic 1', timestamp: '2020-01-01' },
  { description: 'comment 2', topic: 'topic 2', timestamp: '2020-01-02' },
  { description: 'comment 3', topic: 'topic 3', timestamp: '2020-01-03' },
  { description: 'comment 4', topic: 'topic 4', timestamp: '2020-01-04' },
  {
    description:
      'comment 5 we will see it this works and then will be cake fhaosihd doasidofh aodf haosdfahdo ihaosdfihaosdifoia hofih ofaihd odafh oasihdf oasdhif oiasdho fihadso ihafoihaosdfhoasdih oaisf h',
    topic: 'topic 5',
    timestamp: '2020-01-05',
  },
  { description: 'comment 6', topic: 'topic 6', timestamp: '2020-01-06' },
  { description: 'comment 7', topic: 'topic 7', timestamp: '2020-01-07' },
  { description: 'comment 8', topic: 'topic 8', timestamp: '2020-01-08' },
  { description: 'comment 1', topic: 'topic 1', timestamp: '2020-01-01' },
  { description: 'comment 2', topic: 'topic 2', timestamp: '2020-01-02' },
  { description: 'comment 3', topic: 'topic 3', timestamp: '2020-01-03' },
  { description: 'comment 4', topic: 'topic 4', timestamp: '2020-01-04' },
  { description: 'comment 5', topic: 'topic 5', timestamp: '2020-01-05' },
  { description: 'comment 6', topic: 'topic 6', timestamp: '2020-01-06' },
  { description: 'comment 7', topic: 'topic 7', timestamp: '2020-01-07' },
  { description: 'comment 8', topic: 'topic 8', timestamp: '2020-01-08' },
]

interface Props {
  contentHash: string // -> PublicPirateDb get users + content fetch
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
  const publicPirateDb = new PublicPirateDb(bee, Utils.hexToBytes(contentHash), VERSION_HASH)
  const [childrenElements, setChildrenElements] = useState<ReactElement[]>([])
  const [commentText, setCommentText] = useState('')

  useEffect(() => {
    initDoneFn(level, orderNo)
  })

  useEffect(() => {
    if (loadingThreadId[0] === level && loadingThreadId[1] === orderNo) {
      // init Children Thread elements
      initChildren()
    }
    // if -1, -1, then set loading more and comment section
  }, [loadingThreadId])

  const initChildren = async () => {
    const record = await publicPirateDb.getLatestRecord()

    if (!record) {
      initChildrenDoneFn(level, orderNo) //children has

      return
    }
    const ethAddresses = record.ethAddresses.map(e => hexToBytes(e)).reverse() // most recent comment is the first index
    const userComment = new UserComment(bee, contentHash)
    for (const [index, ethAddress] of Object.entries(ethAddresses)) {
      const contentHash = await userComment.fetchCommentReference(Utils.makeEthAddress(ethAddress))
      setChildrenElements([
        ...childrenElements,
        <Thread
          contentHash={contentHash}
          level={level + 1}
          orderNo={Number(index)}
          bee={bee}
          initChildrenDoneFn={initChildrenDoneFn}
          loadingThreadId={loadingThreadId}
          initDoneFn={initDoneFn}
          wallet={wallet}
        />,
      ])
    }
    initChildrenDoneFn(level, orderNo)
  }

  const handleSendComment = async (e: FormEvent) => {
    e.preventDefault()
    const userComment = new UserComment(bee, contentHash)
    await userComment.writeComment(commentText, wallet)
    await publicPirateDb.broadcastEthAddresses([Utils.makeEthAddress(wallet.address.replace('0x', ''))])
  }

  const commentItems = comments.map(comment => <Comment {...comment} />)

  return (
    <div>
      <ContentView contentHash={contentHash} />
      <div children={childrenElements}></div>

      <div className="write-comment">
        <form onSubmit={handleSendComment}>
          <input
            className="commentInput"
            type="text"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
          />
          <input className="btn" type="submit" value="Comment" />
        </form>
      </div>
      <div className="comments-section">{commentItems}</div>
    </div>
  )
}

import { Bee, Reference, Utils } from '@fairdatasociety/bee-js'
import { Wallet } from 'ethers'
import { FormEvent, InputHTMLAttributes, ReactElement, useState } from 'react'
import { useEffect } from 'react'
import ContentView from './ContentView'
import AnyUpload from './services/AnyUpload'
import GraffitiFeed from './services/GraffitiFeed'
import { Comment, UserComment } from './services/UserComment'
import { getBlobType, VERSION_HASH } from './Utility'
const { hexToBytes } = Utils

interface Props {
  contentHash: Reference // -> GraffitiFeed get users + content fetch
  level: number
  orderNo: number
  bee: Bee
  /** For writing direct comments */
  wallet: Wallet
}

export default function Thread({ contentHash, level, orderNo, bee, wallet }: Props) {
  const graffitiFeed = new GraffitiFeed(bee, Utils.hexToBytes(contentHash), VERSION_HASH)
  const [childrenElements, setChildrenElements] = useState<ReactElement[]>([])
  const [commentText, setCommentText] = useState('')
  const [submited, settSubmited] = useState(false)
  const [anyFile, setAnyFile] = useState<FileList | null>(null)
  const [loading, settLoading] = useState(true)
  const [anyUpload, setAnyUpload] = useState(new AnyUpload(bee))

  const init = () => {
    if (level < 1) initChildren()
    settLoading(false)
  }

  useEffect(() => {
    console.log('thread constructor', level, orderNo)
    init()
  }, [])

  useEffect(() => {
    setAnyUpload(new AnyUpload(bee))
    init()
  }, [bee])

  const initChildren = async () => {
    const record = await graffitiFeed.getLatestRecord()

    console.log('record', record)

    if (!record) {
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
          wallet={wallet}
        />,
      )
      console.log('setChildren', commentThreads)
      setChildrenElements([...childrenElements, ...commentThreads])
    }
  }

  const handleAnyUpload = (files: FileList | null) => {
    setAnyFile(files)
  }

  const handleSendComment = async (e: FormEvent) => {
    e.preventDefault()
    settSubmited(true)
    console.log('sending as', await wallet.getAddress())
    const userComment = new UserComment(bee, contentHash)
    // crate post json data
    const comment: Comment = {
      text: commentText,
      timestamp: Date.now(),
      contentHash: contentHash,
      ethAddress: await wallet.getAddress(),
    }

    // upload anything
    if (anyFile) {
      const attachmentReference = await anyUpload.uploadAnything(anyFile)
      const blobType = getBlobType(anyFile)
      comment.attachment = {
        reference: attachmentReference.reference,
        blobType: blobType,
      }
    }
    await graffitiFeed.broadcastEthAddresses([Utils.makeEthAddress(wallet.address.replace('0x', ''))])
    const commentRef = await userComment.writeComment(comment, wallet)
    // push comment
    const commentThreads = [
      <Thread
        key={`${level + 1}-${childrenElements.length}`}
        contentHash={commentRef}
        level={level + 1}
        orderNo={childrenElements.length}
        bee={bee}
        wallet={wallet}
      />,
    ]
    setChildrenElements([...childrenElements, ...commentThreads])
    settSubmited(false)
    setCommentText('')
  }

  return (
    <div>
      {loading ? <div className="loader">Loading...</div> : null}
      <ContentView contentHash={contentHash} bee={bee} level={level} />

      <div children={childrenElements}></div>
      {level > 0 ? null : (
        <div className="write-comment">
          <form onSubmit={handleSendComment}>
            <div style={{ marginBottom: 12, marginTop: 12 }}>
              <input
                type="file"
                id="upload-directory"
                multiple
                onChange={e => handleAnyUpload(e.target.files)}
              ></input>
            </div>
            <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)} />
            <input
              disabled={submited}
              className="btn"
              type="submit"
              value={submited ? 'Wait...' : 'Submit'}
            />
          </form>
        </div>
      )}
    </div>
  )
}

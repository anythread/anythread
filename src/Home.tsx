import { ReactElement, useState, FormEvent } from 'react'
import { Bee, Utils } from '@ethersphere/bee-js'
import { Wallet } from 'ethers'

interface Props {
  bee: Bee
  wallet: Wallet
}

export default function Home({ bee, wallet }: Props): ReactElement {
  const [commentText, setCommentText] = useState('')

  const handleSendComment = (e: FormEvent) => {
    e.preventDefault()
    //const userComment = new UserComment(bee, contentHash)
    //await userComment.writeComment(commentText, wallet)
    //await publicPirateDb.broadcastEthAddresses([Utils.makeEthAddress(wallet.address.replace('0x', ''))])
  }

  return (
    <div className="anythread-home">
      <div className="anythread-home-content">
        <div className="write-comment">
          <form onSubmit={handleSendComment}>
            <input
              style={{ width: '80%', margin: '20px' }}
              className="commentInput"
              type="text"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Type anything to create new thread"
            />
            <br />
            <input className="btn" type="submit" value="Create Thread" />
          </form>
        </div>
      </div>
    </div>
  )
}

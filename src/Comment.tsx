import { ReactElement } from 'react'
import Linkify from 'react-linkify'

interface Props {
  timestamp: string
  description: string
  topic: string
}

export default function Comment(comment: Props): ReactElement {
  return (
    <div className="anythread-comment">
      <div className="anythread-comment-name">{comment.topic}</div>
      <div className="anythread-comment-date">{comment.timestamp}</div>
      <div className="anythread-comment-content">
        <Linkify>{comment.description}</Linkify>
      </div>
    </div>
  )
}

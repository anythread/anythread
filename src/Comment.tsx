import { ReactElement } from 'react'

interface Props {
  comment: string
}

export default function Comment({ comment }: Props): ReactElement {
  return (
    <div className="anythread-comment">
      <div className="anythread-comment-name">BeeTard</div>
      <div className="anythread-comment-date">1956.10.23</div>
      <div className="anythread-comment-content">{comment}</div>
    </div>
  )
}

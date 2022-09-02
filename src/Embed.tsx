import { ReactElement } from 'react'

interface Props {
  data: string
}

export default function Embed({ data }: Props): ReactElement {
  return (
    <iframe
      src={data}
      allowFullScreen
      allow="accelerometer;·autoplay;·clipboard-write;·encrypted-media;·gyroscope;·picture-in-picture·full;·scripts"
      sandbox=""
    />
  )
}

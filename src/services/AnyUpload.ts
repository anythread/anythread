import { Bee, UploadResultWithCid } from '@fairdatasociety/bee-js'
import { getBlobType, STAMP_ID } from '../Utility'

export default class AnyUpload {
  constructor(private bee: Bee) {}

  public uploadAnything(file: FileList): Promise<UploadResultWithCid> {
    const blobType = getBlobType(file)

    if (blobType === 'folder') return this.bee.uploadFiles(STAMP_ID, file)

    return this.bee.uploadFile(STAMP_ID, file[0])
  }
}

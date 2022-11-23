import { Bee, UploadResultWithCid } from '@fairdatasociety/bee-js'
import { getBlobType } from '../Utility'
import { stampPicker } from './StampPicker'

export default class AnyUpload {
  constructor(private bee: Bee) {}

  public uploadAnything(file: FileList): Promise<UploadResultWithCid> {
    const blobType = getBlobType(file)

    if (blobType === 'folder') return this.bee.uploadFiles(stampPicker.batchId, file)

    return this.bee.uploadFile(stampPicker.batchId, file[0])
  }
}

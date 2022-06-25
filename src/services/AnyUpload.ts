import { Bee, UploadResultWithCid } from '@ethersphere/bee-js'
import { getBlobType, HAS_SWARM_EXTENSION, STAMP_ID } from '../Utility'

/** in bytes */
export const MAX_GATEWAY_SIZE = 1024 * 1024 * 10 // 10 MB

export default class AnyUpload {
  constructor(private bee: Bee) {}

  public uploadAnything(file: FileList): Promise<UploadResultWithCid> {
    const blobType = getBlobType(file)

    if (blobType === 'folder') return this.bee.uploadFiles(STAMP_ID, file)

    return this.bee.uploadFile(STAMP_ID, file[0])
  }

  public checkAnythingSize(files: FileList): boolean {
    const blobType = getBlobType(files)

    if (blobType === 'folder') {
      let anythingSize = 0
      for (const file of files) {
        anythingSize += file.size
      }

      if (anythingSize > MAX_GATEWAY_SIZE && !HAS_SWARM_EXTENSION) {
        return false
      }

      return true
    }

    console.log('filesize', files[0].size, MAX_GATEWAY_SIZE)

    if (files[0].size > MAX_GATEWAY_SIZE && !HAS_SWARM_EXTENSION) {
      return false
    }

    return true
  }
}

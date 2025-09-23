import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { app } from './firebase'

const storage = getStorage(app)

export async function uploadEvidence(projectId, testId, file) {
  const path = `projects/${projectId}/tests/${testId}/${Date.now()}-${file.name}`
  const storageRef = ref(storage, path)
  const snap = await uploadBytes(storageRef, file)
  const url = await getDownloadURL(snap.ref)
  return {
    path,
    url,
    contentType: file.type || snap.metadata?.contentType || null,
    size: file.size || snap.metadata?.size || null,
    name: file.name
  }
}

export async function deleteEvidenceDirect(path) {
  const storageRef = ref(storage, path)
  await deleteObject(storageRef)
}

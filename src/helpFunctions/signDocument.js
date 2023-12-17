import { useDocumentStore } from "@/store/document";
import { useCertificateStore } from "@/store/certificate"

const documentStore = useDocumentStore()
const certificateStore = useCertificateStore()



export default async function (docId, docName, certificateThumbprint) {
  const url = `http://127.0.0.1:8000/edi/documents/${docId}/download/`
  const file = await documentStore.downloadFile(url)
  const signature = await certificateStore.createSignature(file, certificateThumbprint)
  const base64FileContent = await certificateStore.blobToBase64(file)
  await certificateStore.getAllSignersInfo(signature, base64FileContent)

  const formData = new FormData();
  const filename = docName
  formData.append('file', new Blob([signature], { type: 'application/octet-stream' }), filename + '.sig');
  formData.append('document', docId);

  await certificateStore.sendSignatureToServer(docId, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}


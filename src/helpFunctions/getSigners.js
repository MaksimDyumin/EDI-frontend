import { useDocumentStore } from "@/store/document";
import { useCertificateStore } from "@/store/certificate"

const documentStore = useDocumentStore()
const certificateStore = useCertificateStore()


export default async function (docId) {
  
  await documentStore.getDocument(docId)
  const docUrl = `http://127.0.0.1:8000/edi/documents/${docId}/download/`
  const documentBlob = await documentStore.downloadFile(docUrl)

  const base64FileContent = await certificateStore.blobToBase64(documentBlob)

  const signatures = documentStore.parsedDocument.signatures
  let signers = []

  for (let signatureId of signatures) {
    const url = `http://127.0.0.1:8000/edi/signatures/${signatureId}/`;
    const responseData = await certificateStore.downloadSignature(url);

    const signatureContent = await new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.onerror = reject;
      fileReader.readAsText(responseData);
    });

    const signer = await certificateStore.getAllSignersInfo(signatureContent, base64FileContent);
    signers.push(signer);
  }

  return signers
}


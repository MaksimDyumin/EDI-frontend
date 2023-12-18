<template>
  <div class="main-container">
    <h2><b>Имя документа:</b> {{ documentStore.parsedDocument.name }}</h2>
    <h2><b>Отправитель:</b> {{ creatoreFullname }}</h2>
    <h2><b>Статус:</b> {{ documentStore.parsedDocument.status }}</h2>
    <h2><b>Дата:</b> {{ new Date(documentStore.parsedDocument.updated_at).toLocaleString() }}</h2>
    <h2><b>Требуется подпись:</b> {{ needSign }}</h2>
    <div class="doc-manager-body mt-8">

      <SignersInfo :signers="certificateStore.documentSignatures"></SignersInfo>

      <div class="preview-container">
        <div class="download-icons">
            <v-icon @click="downloadDocument" class="cursor-pointer mr-1">mdi-download</v-icon>
          <input @change="updateFilename" ref="inv_input" class="invisible-input" type="file">
        </div>
        {{ newFilename }}
      </div>
    </div>

    
  </div>
</template>


<script>
import { useDocumentStore } from "@/store/document";
import { useCertificateStore } from "@/store/certificate"
import signDoc from '@/helpFunctions/signDocument'
import getSigners from '@/helpFunctions/getSigners'
import SignersInfo from '@/components/signersInfo.vue' 

export default {
  setup(props) {
    const documentStore = useDocumentStore()
    const certificateStore = useCertificateStore()
    return {
      documentStore,
      certificateStore
    }
  },
  components: {
    SignersInfo
  },
  data() {
    return {
      applyDialog: false,
      fixDialog: false,
      rejectDialog: false,
      signDialog: false,
      fixComment: '',
      path: this.$route.path.split('/'),
      certificateThumbprint: null,
      newFilename: '',
    }
  },
  async mounted() {
    const docId = this.$route.params.docId
    await this.documentStore.getDocument(docId)
    const signers = await getSigners(docId)
    this.certificateStore.documentSignatures = signers
  },
  computed: {
    creatoreFullname() {
      const creator = this.documentStore.parsedDocument.creator
      return creator?.first_name + " " + creator?.last_name
    },
    needSign() {
      return this.documentStore.parsedDocument.need_sign ? 'Да' : 'Нет'
    },
    isComplete() {
      const status = this.documentStore.parsedDocument.status
      if (status === 'Отклонен' || status === 'Завершен') {
        return true
      }
      return false
    }
  },
  methods: {
    async applyDoc(docId) {
      this.applyDialog = false
      await this.documentStore.applyDoc(docId)
      this.$router.push({ name: this.path[1] })
    },

    async rejectDocument(docId) {
      await this.documentStore.rejectDoc(docId)
      this.$router.push({ name: this.path[1] })
    },

    async openSignDialog() {
      await this.certificateStore.getSertificates()
      this.signDialog = true
    },
    async signDocument(docId) {
      await signDoc(docId, this.documentStore.parsedDocument.name, this.certificateThumbprint)
      const signers = await getSigners(docId)
      this.certificateStore.documentSignatures = signers
      this.signDialog = false
    },

  async downloadDocument() {
      const url = `documents/${this.documentStore.parsedDocument.id}/download/`
      await this.documentStore.downloadFileToClient(url, this.documentStore.parsedDocument.name)
    },


    async sendToFix(docId) {
      this.fixDialog = false
      const requestBody = {
        text: this.fixComment
      }
      await this.documentStore.sendToFix(docId, requestBody)
      this.$router.push({ name: this.path[1] })
    },
    chooseNewFile() {
      const input = this.$refs.inv_input
      input.click()
    },
    itemProps(item) {
      return {
        title: item.name,
        subtitle: item.endDate,
        value: item.thumbprint,
      }
    },
  },
}
</script>


<style scoped>
.preview-container {
  width: 400px;
  height: 600px;
  border: 1px solid;
  position: relative;
  padding: 10px;
  border-radius: 5px;
}

.doc-manager-body {
  display: flex;
  justify-content: space-between;
  max-width: 1200px;
}
.download-icons{
  position: absolute;
  bottom: 0;
  right: 0;
  display: flex;
}
.doc-manager-actions {
  display: flex;
  flex-direction: column;
}
h2{
  font-weight: normal;
}
</style>
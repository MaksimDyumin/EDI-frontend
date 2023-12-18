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

      <div class="doc-manager-actions pl-4 pr-4">
        <v-btn @click="() => { applyDialog = !applyDialog }" color="green" v-if="!isComplete">
          <v-icon class="mr-1">mdi-checkbox-marked-circle-outline</v-icon>
          Подтвердить
        </v-btn>
        <v-btn @click="() => { fixDialog = !fixDialog }" class="mt-3" color="warning" v-if="!isComplete">
          <v-icon class="mr-1">mdi-comment-arrow-right-outline</v-icon>
          На исправление
        </v-btn>

        <v-btn @click="() => { rejectDialog = !rejectDialog }" class="mt-3" color="red" v-if="!isComplete">
          <v-icon class="mr-1">mdi-cancel</v-icon>
          Отклонить
        </v-btn>

        <v-btn @click="openSignDialog" class="mt-12" color="primary" v-if="!isComplete">
          <v-icon class="mr-1">mdi-draw-pen</v-icon>
          Подписать
        </v-btn>
      </div>
      <div class="signature-container"></div>
    </div>

    <v-dialog width="500" v-model="applyDialog">
      <v-card>
        <v-card-text>
          Уверены что хотите подтвердить документ: <b>{{ documentStore.parsedDocument.name }}</b>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red-darken-1" variant="text" @click="applyDialog = false">
            Отменить
          </v-btn>
          <v-btn color="green-darken-1" variant="text" @click="applyDoc($route.params.docId)">
            Подтвердить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog width="500" v-model="fixDialog">
      <v-card>
        <v-card-text>
          <span>Напишите комментарий для исправления документа: <b>{{ documentStore.parsedDocument.name }}</b></span>

          <v-text-field v-model="fixComment" class="mt-4"></v-text-field>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red-darken-1" variant="text" @click="fixDialog = false">
            Отменить
          </v-btn>
          <v-btn color="green-darken-1" variant="text" @click="sendToFix($route.params.docId)">
            Подтвердить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog width="500" v-model="rejectDialog">
      <v-card>
        <v-card-text>
          <span>Вы действительно хотите отклонить документ: <b>{{ documentStore.parsedDocument.name }}</b></span>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red-darken-1" variant="text" @click="rejectDialog = false">
            Отменить
          </v-btn>
          <v-btn color="green-darken-1" variant="text" @click="rejectDocument($route.params.docId)">
            Подтвердить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog width="500" v-model="signDialog">
      <v-card :title="`Уверены что хотите подписать документ: ${documentStore.parsedDocument.name}`">
        <v-card-text>
          <v-select :items="certificateStore.certificatesInfo" v-model="certificateThumbprint" :item-props="itemProps"
            label="Выберите сертификат">
          </v-select>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red-darken-1" variant="text" @click="signDialog = false">
            Отменить
          </v-btn>
          <v-btn color="green-darken-1" variant="text" @click="signDocument($route.params.docId)">
            Подтвердить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
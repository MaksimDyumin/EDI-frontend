<template>
  <div class="main-container">
    <h2><b>Имя документа:</b> {{ documentStore.parsedDocument.name }}</h2>
    <h2><b>Отправитель:</b> {{ creatoreFullname }}</h2>
    <h2><b>Статус:</b> {{ documentStore.parsedDocument.status }}</h2>
    <h2><b>Дата:</b> {{ new Date(documentStore.parsedDocument.updated_at).toLocaleString() }}</h2>
    <h2><b>Требуется подпись:</b> {{ needSign }}</h2>
    <div class="doc-manager-body mt-8">
      <SignersInfo :signers="certificateStore.documentSignatures" />
      <div class="preview-container">
        <div class="download-icons">
            <v-icon @click="downloadDocument" class="cursor-pointer mr-1">mdi-download</v-icon>
            <v-icon @click="chooseNewFile" class="cursor-pointer">mdi-upload</v-icon>
            <input @change="updateFilename" ref="inv_input" class="invisible-input" type="file">
        </div>
        {{ newFilename }}
      </div>

      <div class="doc-manager-actions">
        <v-btn @click="() => { applyDialog = !applyDialog }" color="green">
          <v-icon class="mr-1">mdi-checkbox-marked-circle-outline</v-icon>
          Переотправить
        </v-btn>
        <v-btn @click="() => { commentsDialog = !commentsDialog }" class="mt-3" color="primary">
          <v-icon class="mr-1">mdi-comment-text-multiple-outline</v-icon>
          Комментарии
        </v-btn>
        <v-btn @click="openSignDialog" class="mt-3" color="primary">
          <v-icon class="mr-1">mdi-draw-pen</v-icon>
          Подписать
        </v-btn>
      </div>
    </div>

    <v-dialog width="500" v-model="applyDialog">
      <v-card title="Dialog">
        <v-card-text>
          Уверены что хотите подтвердить документ: <b>{{ newFilename }}</b>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red-darken-1" variant="text" @click="applyDialog = false">
            Отменить
          </v-btn>
          <v-btn color="green-darken-1" variant="text" @click="applyDoc(documentStore.parsedDocument.id)">
            Подтвердить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog width="500" v-model="signDialog">
      <v-card :title="`Уверены что хотите подписать документ: ${documentStore.parsedDocument.name}`">
        <v-card-text>
          <v-select :items="certificateStore.certificatesInfo" v-model="certificateThumbprint" :item-props="itemProps"
            label="Выберите опцию">
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

    <v-dialog width="500" v-model="commentsDialog">
      <div class="comments-card-container">
        <v-card title="Коммнетарии">
        <v-card-text>
          <v-card v-for="comment in documentStore.parsedDocument.comments" :key="comment" class="">
            <h4 class="pa-2"><b>{{recipientFullname}}:</b> {{comment.text}}</h4>
            <span class="pa-2 comment-data">{{new Date(comment.created_at).toLocaleDateString()}}</span>
          </v-card>
        </v-card-text>
      </v-card>
      </div>
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
      newFilename: '',
      path: this.$route.path.split('/'),
      signDialog: false,
      certificateThumbprint: null,
      commentsDialog: false
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
    recipientFullname() {
      const creator = this.documentStore.parsedDocument.recipient
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

      const formData = new FormData();
      const file = this.$refs.inv_input.files[0]
      formData.append('file', file)

      const requestBody = formData
      console.log(file)
      await this.documentStore.sendFixes(docId, requestBody, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      this.$router.push({name: this.path[1]})
    },
    async downloadDocument() {
      const url = `documents/${this.documentStore.parsedDocument.id}/download/`
      await this.documentStore.downloadFileToClient(url, this.documentStore.parsedDocument.name)
    },
    itemProps(item) {
      return {
        title: item.name,
        subtitle: item.endDate,
        value: item.thumbprint,
      }
    },
    async openSignDialog() {
      await this.certificateStore.getSertificates()
      this.signDialog = true
    },
    chooseNewFile() {
      const input = this.$refs.inv_input
      input.click()
    },
    updateFilename(){
      const file = this.$refs.inv_input.files[0]
      this.newFilename = file.name
    },
    async signDocument(docId) {
      await signDoc(docId, this.documentStore.parsedDocument.name, this.certificateThumbprint)
      await this.documentStore.getDocument(docId)
      this.signDialog = false
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

.doc-manager-actions {
  display: flex;
  flex-direction: column;
}
.download-icons{
  position: absolute;
  bottom: 0;
  right: 0;
  display: flex;
}
h2, h4{
  font-weight: normal;
}

.comments-card-container{
  max-height: 600px;
  overflow: auto;
}
.comment-data{
  color: gray;
}
</style>
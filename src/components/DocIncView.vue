<template>
  <div class="main-container">
    <h2>Имя документа: {{ documentStore.parsedDocument.name }}</h2>
    <h2>Отправитель: {{ creatoreFullname }}</h2>
    <h2>Статус: {{ documentStore.parsedDocument.status }}</h2>
    <h2>Дата {{ new Date(documentStore.parsedDocument.updated_at).toLocaleString() }}</h2>
    <div class="doc-manager-body mt-8">
      <div class="preview-container">
      </div>
      <div class="doc-manager-actions">
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
        <v-btn @click="() => { rejectDialog = !rejectDialog }" class="mt-12" color="primary" v-if="!isComplete">
          <v-icon class="mr-1">mdi-draw-pen</v-icon>
          Подписать
        </v-btn>
      </div>
    </div>

    <v-dialog width="500" v-model="applyDialog">
      <v-card title="Dialog">
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
      <v-card title="Dialog">
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
      <v-card title="Dialog">
        <v-card-text>
          <span>Уверены что хотите отклонить документ: <b>{{ documentStore.parsedDocument.name }}</b></span>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red-darken-1" variant="text" @click="rejectDialog = false">
            Отменить
          </v-btn>
          <v-btn color="green-darken-1" variant="text" @click="rejectDoc($route.params.docId)">
            Подтвердить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>


<script>
import { useDocumentStore } from "@/store/document";

export default {
  setup(props) {
    const documentStore = useDocumentStore()

    return { documentStore }
  },
  data() {
    return {
      applyDialog: false,
      fixDialog: false,
      rejectDialog: false,
      fixComment: '',
      path: this.$route.path.split('/'),
      CAPICOM_CURRENT_USER_STORE: 2,
      CAPICOM_MY_STORE: "My",
      CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED: 2,
    }
  },
  async mounted() {
    const docId = this.$route.params.docId
    await this.documentStore.getDocument(docId)
  },
  computed: {
    creatoreFullname() {
      const creator = this.documentStore.parsedDocument.creator
      return creator?.first_name + " " + creator?.last_name
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

    async sendToFix(docId) {
      this.fixDialog = false
      const requestBody = {
        text: this.fixComment
      }
      await this.documentStore.sendToFix(docId, requestBody)
      this.$router.push({ name: this.path[1] })
    },

    async rejectDoc(docId) {
      this.rejectDialog = false
      await this.documentStore.rejectDoc(docId)
      this.$router.push({ name: this.path[1] })
    },

    async SignCreate(certSubjectName, dataToSign) {
      var oStore = await cadesplugin.CreateObjectAsync("CAdESCOM.Store");
      await oStore.Open(
        this.CAPICOM_CURRENT_USER_STORE, 
        this.CAPICOM_MY_STORE, 
        this.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED
      )
      var oStoreCerts = await oStore.Certificates;

      let selectInner = ''
      for (let i = 1; i < await oStoreCerts.Count + 1; i++) {
        console.log(i)
        const itemI = await oStoreCerts.Item(i)
        console.log(itemI)
        console.log(await itemI.GetInfo(0))

        const certName = await itemI.GetInfo(0)
        selectInner += `<option value="${certName}">${certName}</option>`
      }
    },
  },
}
</script>


<style>
.preview-container {
  width: 400px;
  height: 600px;
  border: 1px solid;
}

.doc-manager-body {
  display: flex;
  justify-content: space-between;
  max-width: 800px;
  margin: auto;
}

.doc-manager-actions {
  display: flex;
  flex-direction: column;
}
</style>
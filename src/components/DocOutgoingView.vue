<template>
  <div class="main-container">
    <h2>Имя документа: {{ documentStore.parsedDocument.name }}</h2>
    <h2>Отправитель: {{ creatoreFullname }}</h2>
    <h2>Статус: {{ documentStore.parsedDocument.status }}</h2>
    <h2>Дата {{ new Date(documentStore.parsedDocument.updated_at).toLocaleString() }}</h2>
    <div class="doc-manager-body mt-8">
      <div class="preview-container">
        <div class="download-icons">
          <a :href="`http://127.0.0.1:8000/edi/documents/${documentStore.parsedDocument.id}/download/`" download="">
            <v-icon class="cursor-pointer mr-1">mdi-download</v-icon>
          </a>
          
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
        <v-btn @click="() => { applyDialog = !applyDialog }" class="mt-3" color="primary">
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
          <v-btn color="green-darken-1" variant="text" @click="applyDoc(documentStore.parsedDocument.id)">
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
      newFilename: '',
      path: this.$route.path.split('/')
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

      const formData = new FormData();
      const file = this.$refs.inv_input.files[0]
      formData.append('file', file)

      const requestBody = formData

      await this.documentStore.sendFixes(docId, requestBody, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      this.$router.push({name: this.path[1]})
    },
    chooseNewFile() {
      const input = this.$refs.inv_input
      input.click()
    },
    updateFilename(){
      const file = this.$refs.inv_input.files[0]
      this.newFilename = file.name
    },
  },
}
</script>


<style>
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
  max-width: 800px;
  margin: auto;
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
</style>
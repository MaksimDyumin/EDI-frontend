<template>
  <div class="main-container">
    <v-card class="line-card">
      <v-btn @click="openDialog" elevation="0">
        <v-icon class="cursor-pointer mr-1">mdi-plus</v-icon>
        Создать документ
      </v-btn>
    </v-card>
    <v-dialog width="500" v-model="applyDialog">
      <v-card title="Создание документа">
        <v-card-text>
          <div class="mt-2 d-flex flex-column">
            <v-btn class="ml-2" color="primary" @click="selectFile">Загрузить файл</v-btn>
            <span class="ml-2 mt-2"><b>Файл:</b> {{ fileName === '' ? 'Вы еще не загрузили файл' : fileName }}</span>
            <input ref="inv_input" class="invisible-input" type="file" id="fileInput" @change="handleFileUpload" />
            <v-checkbox v-model="needSign" label="Получатель подпишет документ" color="primary"></v-checkbox>

            <v-select 
              :items="userStore.getUsersName" 
              v-model="recipient" 
              :item-props="itemProps" 
              label="Выберите получателя" 
            >
            </v-select>
            
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red-darken-1" variant="text" @click="applyDialog = false">
            Отменить
          </v-btn>
          <v-btn color="green-darken-1" variant="text" @click="createDocument()">
            Подтвердить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>


<script>
import { useUserStore } from '@/store/user'
import { useDocumentStore } from '@/store/document'

export default {
  setup(props) {
    const userStore = useUserStore()
    const documentStore = useDocumentStore()
    return {
      userStore,
      documentStore
    }
  },
  data() {
    return {
      applyDialog: false,
      fileName: '',
      needSign: false,
      path: this.$route.path.split('/'),
      recipient: ''
    }
  },
  async mounted() {
    await this.userStore.getUsers()
  },
  methods: {
    selectFile() {
      this.$refs.inv_input.click()
    },

    itemProps(item) {
      return {
        title: item.fullname,
        subtitle: item.department,
        value: item.id,
      }
    },

    handleFileUpload() {
      this.fileName = this.$refs.inv_input.files[0].name
    },
    async createDocument() {
      const file = this.$refs.inv_input.files[0];
      const formData = new FormData();
      formData.append('file', file)
      formData.append('need_sign', this.needSign)
      formData.append('recipient', this.recipient)

      const requestBody = formData
      await this.documentStore.createDocument(requestBody, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      await this.documentStore.getSentDocuments()
      this.applyDialog = false
    },
    async openDialog() {
      this.applyDialog = true
    }
  },
}
</script>


<style>
.line-card {
  padding: 10px;
}
</style>
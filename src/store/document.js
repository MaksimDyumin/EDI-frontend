import { defineStore } from 'pinia'
import getApi from '@/plugins/axios'

const api = getApi().api
const publicClient = getApi().publicClient


export const useDocumentStore = defineStore('document', {
  state: () => ({
    documentInboxList: [],
    documentSentList: [],
    documentHistoryList: [],
    overviewDocument: {},
    statusMap: {
      Wait_Processing: "Ожидает обработки",
      Wait_Fix: "Ожидает исправления",
      Rejected: "Отклонен",
      Complete: "Завершен",
    }
  }),

  getters: {
    parsedInboxList: (state) => {
      const newVal = state.documentInboxList.map((value) => {
        const status = value.status
        value.status = state.statusMap[status]
        return value
      })
      return newVal
    },
    parsedSentList: (state) => {
      const newVal = state.documentSentList.map((value) => {
        const status = value.status
        value.status = state.statusMap[status]
        return value
      })
      return newVal
    },
    parsedHistoryList: (state) => {
      const newVal = state.documentHistoryList.map((value) => {
        const status = value.status
        value.status = state.statusMap[status]
        return value
      })
      return newVal
    },
    parsedDocument: (state) => {
      const status = state.overviewDocument.status
      state.overviewDocument.status = state.statusMap[status]
      return state.overviewDocument
    }
  },

  actions: {
    async getInboxDocuments() {
      const response = await api.get('documents/inbox/')
      this.documentInboxList = response.data
      return response
    },
    async getSentDocuments() {
      const response = await api.get('documents/sent/')
      this.documentSentList = response.data
      return response
    },
    async getCompleteDocuments() {
      const response = await api.get('documents/')
      this.documentHistoryList = response.data
      return response
    },
    async getDocument(docId) {
      const response = await api.get(`documents/${docId}/`)
      this.overviewDocument = response.data
      return response
    },

    async createDocument(requestBody, options) {
      const response = await api.post('documents/', requestBody, options)
      return response
    },

    async applyDoc(docId) {
      await api.post(`documents/${docId}/accept/`, {})
    },

    async sendToFix(docId, requestBody) {
      await api.put(`documents/${docId}/await_fixes/`, requestBody)
    },

    async sendFixes(docId, requestBody, options) {
      await api.post(`documents/${docId}/send_fixes/`, requestBody, options)
    },

    async rejectDoc(docId) {
      await api.post(`documents/${docId}/reject/`, {})
    },

    async downloadFile(url) {
      try {
        const response = await api.get(url, { responseType: 'blob' });
        return response.data; // Возвращаем файл как Blob
      } catch (error) {
        console.error('Ошибка при загрузке файла:', error);
        throw error;
      }
    },

    async downloadFileToClient(serverUrl, filename) {
      const responseData = await this.downloadFile(serverUrl)

      try {
        const reader = new FileReader();
        reader.readAsDataURL(responseData);
        reader.onload = (e) => {
          const link = document.createElement('a');
          link.href = e.target.result;
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          link.remove();
        };
      } catch (error) {
        console.error('Ошибка при загрузке файла:', error);
        throw error;
      }
    }
  }
})
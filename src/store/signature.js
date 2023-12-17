import { defineStore } from 'pinia'
import getApi from '@/plugins/axios'

const api = getApi().api
const publicClient = getApi().publicClient


export const useSignatureStore = defineStore('signature', {
  state: () => ({
    signatures: []
  }),

  getters: {
  },

  actions: {
  }
})
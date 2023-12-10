// Utilities
import { defineStore } from 'pinia'
import useCookie from '@/plugins/useCookie'
import getApi from '@/plugins/axios'
import { VLabel } from 'vuetify/lib/components/index.mjs'

const api = getApi().api
const publicClient = getApi().publicClient

export const useUserStore = defineStore('user', {
  state: () => ({
    user: undefined,
    isLoggin: false,
    users: []
  }),

  getters: {
    getUsersName: (state) => {
      const usersWithFullname = state.users.map((value, index, array) => {
        const user = value
        value.fullname = user.first_name + " " + user.last_name
        return value
      })
      return usersWithFullname
      // let userNames = []
      // for(let user of usersWithFullname){
      //   userNames.push(user.fullname)
      // }
      // return userNames
    }
  },

  actions: {
    async loginUser(requestBody) {
      const response = await api.post('token/', requestBody)
      const refreshToken = useCookie('refreshToken')
      const accessToken = useCookie('accessToken')
      refreshToken.value = response.data.refresh
      accessToken.value = response.data.access
      this.isLoggin = true
      return response
    },
    async logout() {
      this.user = undefined
      this.isLoggin = false
      const refreshToken = useCookie('refreshToken')
      const accessToken = useCookie('accessToken')
      refreshToken.value = undefined
      accessToken.value = undefined
    },

    async getProfile() {
      const response = await api.get('profile/')
      this.user = response.data
      return response
    },

    async getUsers() {
      const response = await api.get('users/')
      this.users = response.data
      return response
    }
  }
})
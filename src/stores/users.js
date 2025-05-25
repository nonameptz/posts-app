import { defineStore } from 'pinia'
import { getUsers } from '@/api/api'

export const useUsersStore = defineStore('users', {
  state: () => ({
    list: [],
    loading: false,
  }),

  actions: {
    async fetchUsers() {
      if (this.list.length) return
      this.loading = true
      this.list = await getUsers()
      this.loading = false
    },
  },

  getters: {
    byId: (state) =>
      state.list.reduce((map, u) => {
        map[u.id] = u.name
        return map
      }, {}),
  },
})

import { api } from '../api/client'

export const usersService = {
  async getUsers() {
    const response = await api.get('/users')
    return response.data
  },

  async updateRole(id, payload) {
    const response = await api.patch(`/users/${id}/role`, payload)
    return response.data
  },
}

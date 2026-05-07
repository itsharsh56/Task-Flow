import { api } from '../api/client'

export const projectsService = {
  async getProjects() {
    const response = await api.get('/projects')
    return response.data
  },

  async getProject(id) {
    const response = await api.get(`/projects/${id}`)
    return response.data
  },

  async createProject(payload) {
    const response = await api.post('/projects', payload)
    return response.data
  },

  async addMember(projectId, payload) {
    const response = await api.post(`/projects/${projectId}/members`, payload)
    return response.data
  },

  async removeMember(projectId, userId) {
    const response = await api.delete(`/projects/${projectId}/members/${userId}`)
    return response.data
  },
}

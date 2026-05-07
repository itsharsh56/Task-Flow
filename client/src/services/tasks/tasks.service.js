import { api } from '../api/client'

export const tasksService = {
  async getTasks(params = {}) {
    const response = await api.get('/tasks', { params })
    return response.data
  },

  async getTask(id) {
    const response = await api.get(`/tasks/${id}`)
    return response.data
  },

  async createTask(payload) {
    const response = await api.post('/tasks', payload)
    return response.data
  },

  async updateTask(id, payload) {
    const response = await api.patch(`/tasks/${id}`, payload)
    return response.data
  },

  async updateTaskStatus(id, payload) {
    const response = await api.patch(`/tasks/${id}/status`, payload)
    return response.data
  },

  async deleteTask(id) {
    const response = await api.delete(`/tasks/${id}`)
    return response.data
  },

  async getComments(taskId) {
    const response = await api.get(`/comments/task/${taskId}`)
    return response.data
  },

  async createComment(payload) {
    const response = await api.post('/comments', payload)
    return response.data
  },
}

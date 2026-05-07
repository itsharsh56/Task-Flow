import { api } from '../api/client'

export const activityService = {
  async getProjectActivity(projectId, params = {}) {
    const response = await api.get(`/activity-logs/project/${projectId}`, { params })
    return response.data
  },
}

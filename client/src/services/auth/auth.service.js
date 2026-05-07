import { api } from '../api/client'

export const authService = {
    async signup(payload) {
        const response = await api.post('/auth/signup', payload)
        return response.data
    },

    async login(payload) {
        const response = await api.post('/auth/login', payload)
        return response.data
    },

    async getProfile() {
        const response = await api.get('/auth/profile')
        return response.data
    },
}

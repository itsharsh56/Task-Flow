import { create } from 'zustand'
import { storage } from '../utils/storage'

export const useAuthStore = create((set) => ({
    token: storage.getToken(),
    user: null,
    isBootstrapping: true,

    setSession: ({ accessToken, user }) => {
        storage.setToken(accessToken)
        set({
            token: accessToken,
            user,
            isBootstrapping: false,
        })
    },

    setUser: (user) =>
        set((state) => ({
            user,
            token: state.token ?? storage.getToken(),
            isBootstrapping: false,
        })),

    finishBootstrap: () =>
        set((state) => ({
            isBootstrapping: false,
            token: state.token ?? storage.getToken(),
        })),

    logout: () => {
        storage.clearToken()
        set({
            token: null,
            user: null,
            isBootstrapping: false,
        })
    },
}))

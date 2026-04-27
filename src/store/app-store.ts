import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AppView =
  | 'splash'
  | 'home'
  | 'profile'
  | 'edit-profile'
  | 'pro-profile'
  | 'register-pro'
  | 'products'
  | 'quotes'
  | 'create-quote'
  | 'quote-detail'
  | 'request-quote'
  | 'payments'
  | 'chat-list'
  | 'chat'
  | 'search'
  | 'notifications'
  | 'settings'

interface User {
  id: string
  name: string | null
  email: string
  phone: string | null
  avatar: string | null
  role: string
  profession: string | null
  bio: string | null
  city: string | null
  province: string | null
  address: string | null
  hourlyRate: number | null
  rating: number
  reviewCount: number
  isAvailable: boolean
  isVerified: boolean
  skills: string[] | null
  experience: string | null
  education: string | null
  certifications: string[] | null
}

interface AppState {
  currentView: AppView
  user: User | null
  token: string | null
  viewParams: Record<string, unknown>

  // Navigation
  setView: (view: AppView, params?: Record<string, unknown>) => void
  goBack: () => void
  viewHistory: AppView[]

  // Auth
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
}

const viewHistoryStack: AppView[] = []

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentView: 'splash',
      user: null,
      token: null,
      viewParams: {},
      viewHistory: [],

      setView: (view, params = {}) => {
        viewHistoryStack.push(useAppStore.getState().currentView)
        set({
          currentView: view,
          viewParams: params,
          viewHistory: [...viewHistoryStack],
        })
      },

      goBack: () => {
        const history = [...viewHistoryStack]
        const prevView = history.pop()
        if (prevView) {
          set({ currentView: prevView, viewHistory: [...history] })
        } else {
          set({ currentView: 'home', viewHistory: [] })
        }
      },

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () =>
        set({
          user: null,
          token: null,
          currentView: 'splash',
          viewHistory: [],
          viewParams: {},
        }),
    }),
    {
      name: 'resolve-app-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
)

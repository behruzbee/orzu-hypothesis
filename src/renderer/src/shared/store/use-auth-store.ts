import { create } from 'zustand'

export interface UserData {
  id: string
  username: string
  role: 'admin' | 'user'
}

interface AuthStore {
  isAuthenticated: boolean
  username: string | null
  role: 'admin' | 'user' | null
  users: UserData[] // <--- Список всех пользователей
  
  login: (username: string, role: 'admin' | 'user') => void
  logout: () => void
  fetchUsers: () => Promise<void> // <--- Функция загрузки
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  username: null,
  role: null,
  users: [],

  login: (username, role) => set({ isAuthenticated: true, username, role }),
  logout: () => set({ isAuthenticated: false, username: null, role: null, users: [] }),

  fetchUsers: async () => {
    try {
      const res = await (window as any).api.getUsers()
      if (res.success) {
        set({ users: res.users })
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error)
    }
  }
}))
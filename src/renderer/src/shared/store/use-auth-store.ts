import { create } from 'zustand'

export interface UserData {
  id: string
  username: string
  role: 'admin' | 'user'
}

interface AuthStore {
  isAuthenticated: boolean
  username: string | null
  userId: string | null 
  role: 'admin' | 'user' | null
  users: UserData[]
  
  login: (userData: UserData) => void
  logout: () => void
  fetchUsers: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  username: null,
  userId: null,
  role: null,
  users: [],

  login: (user) => set({ 
    isAuthenticated: true, 
    username: user.username, 
    role: user.role, 
    userId: user.id 
  }),

  logout: () => set({ 
    isAuthenticated: false, 
    username: null, 
    userId: null, 
    role: null, 
    users: [] 
  }),

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
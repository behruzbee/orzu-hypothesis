// src/renderer/pages/auth-page.tsx
import { useState } from 'react'
import { Target, Lock, User } from 'lucide-react'
import { useAuthStore } from '@renderer/shared/store/use-auth-store'

export const AuthPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Получаем функцию login из стора
  const loginInStore = useAuthStore((state) => state.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Вызываем IPC хендлер (Main процесс)
      const res = await (window as any).api.login({ username, password })

      if (res.success) {
        // ОБНОВЛЕНО: Передаем объект целиком (id, username, role)
        // Теперь стор получит актуальный Postgres UUID
        loginInStore({
          id: res.id,
          username: res.username,
          role: res.role
        }) 
      } else {
        setError(res.error || 'Ошибка авторизации')
      }
    } catch (err) {
      // ОБНОВЛЕНО: Текст ошибки теперь про PostgreSQL
      setError('Нет связи с сервером PostgreSQL. Проверьте VPN или интернет.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-orzu">
            <Target size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Orzu Hypothesis</h1>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">PostgreSQL Edition</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-500 text-xs font-bold rounded-xl text-center border border-red-100">
              {error}
            </div>
          )}

          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Имя пользователя" 
              required 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-orzu font-bold text-slate-700 transition-colors" 
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="password" 
              placeholder="Пароль" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-orzu font-bold text-slate-700 transition-colors" 
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className={`w-full py-4 mt-2 text-white font-black rounded-2xl shadow-lg transition-all tracking-wide ${
              isLoading 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-orzu hover:brightness-105 active:scale-[0.98] shadow-orzu/30'
            }`}
          >
            {isLoading ? 'СОЕДИНЕНИЕ С DB...' : 'ВОЙТИ В СИСТЕМУ'}
          </button>
        </form>
      </div>
    </div>
  )
}
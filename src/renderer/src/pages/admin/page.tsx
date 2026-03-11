import { useState, useEffect } from 'react'
import { Shield, UserPlus, CheckCircle, Users as UsersIcon, UserCircle } from 'lucide-react'
import { useAuthStore } from '@renderer/shared/store/use-auth-store'

interface UserData {
  id: string
  username: string
  role: 'admin' | 'user'
}

export const AdminPage = () => {
  const role = useAuthStore((state) => state.role)
  
  // Стейты для формы
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user')
  const [status, setStatus] = useState<{ type: 'error' | 'success' | null, msg: string }>({ type: null, msg: '' })
  const [isLoading, setIsLoading] = useState(false)

  // Стейт для списка пользователей
  const [usersList, setUsersList] = useState<UserData[]>([])

  // Функция загрузки списка
  const fetchUsers = async () => {
    try {
      const res = await (window as any).api.getUsers()
      if (res.success) {
        setUsersList(res.users)
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error)
    }
  }

  // Загружаем при открытии страницы
  useEffect(() => {
    if (role === 'admin') {
      fetchUsers()
    }
  }, [role])

  if (role !== 'admin') {
    return <div className="flex items-center justify-center h-full text-slate-400 font-bold">У вас нет доступа</div>
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus({ type: null, msg: '' })

    try {
      const res = await (window as any).api.createUser({ username, password, role: newRole })
      
      if (res.success) {
        setStatus({ type: 'success', msg: `Пользователь ${username} успешно создан!` })
        setUsername('')
        setPassword('')
        setNewRole('user')
        // ОБНОВЛЯЕМ СПИСОК СРАЗУ ПОСЛЕ СОЗДАНИЯ
        fetchUsers() 
      } else {
        setStatus({ type: 'error', msg: res.error || 'Ошибка при создании' })
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Нет связи с базой данных' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 h-full relative">
      <div className="mb-2">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Shield className="text-orzu" /> Управление доступом
        </h2>
        <p className="text-sm text-slate-500">Добавляйте сотрудников и управляйте их ролями в системе.</p>
      </div>

      {/* РАЗДЕЛЯЕМ ЭКРАН НА ДВЕ КОЛОНКИ */}
      <div className="flex gap-6 items-start">
        
        {/* ЛЕВАЯ КОЛОНКА: ФОРМА */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-w-md">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <UserPlus size={18} className="text-slate-400" /> Добавить сотрудника
          </h3>

          <form onSubmit={handleCreateUser} className="flex flex-col gap-5">
            {status.type === 'error' && <div className="p-3 bg-red-50 text-red-500 text-sm font-bold rounded-xl text-center">{status.msg}</div>}
            {status.type === 'success' && <div className="p-3 bg-green-50 text-green-600 text-sm font-bold rounded-xl text-center flex items-center justify-center gap-2"><CheckCircle size={16} /> {status.msg}</div>}

            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1">Имя пользователя (Логин)</label>
              <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Например: ivan_product" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orzu font-bold text-slate-700 transition-colors" />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1">Временный пароль</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Минимум 6 символов" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orzu font-bold text-slate-700 transition-colors" />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1">Роль в системе</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setNewRole('user')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${newRole === 'user' ? 'bg-orzu/10 border-orzu text-orzu' : 'bg-transparent border-slate-100 text-slate-400'}`}>Пользователь</button>
                <button type="button" onClick={() => setNewRole('admin')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${newRole === 'admin' ? 'bg-orange-50 border-orange-500 text-orange-600' : 'bg-transparent border-slate-100 text-slate-400'}`}>Администратор</button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className={`w-full py-4 mt-2 text-white font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-orzu hover:brightness-105 active:scale-[0.98]'}`}>
              {isLoading ? 'СОЗДАНИЕ...' : 'СОЗДАТЬ ПОЛЬЗОВАТЕЛЯ'}
            </button>
          </form>
        </div>

        {/* ПРАВАЯ КОЛОНКА: СПИСОК */}
        <div className="flex-[2] bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <UsersIcon size={18} className="text-slate-400" /> Команда ({usersList.length})
          </h3>

          <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-2">
            {usersList.length === 0 ? (
              <p className="text-slate-400 text-sm">Загрузка...</p>
            ) : (
              usersList.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <UserCircle size={24} className={user.role === 'admin' ? 'text-orange-500' : 'text-slate-400'} />
                    <div>
                      <p className="font-bold text-slate-800">{user.username}</p>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        ID: {user.id.slice(-6)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Бейдж роли */}
                  <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest ${
                    user.role === 'admin' 
                      ? 'bg-orange-100 text-orange-600' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {user.role}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
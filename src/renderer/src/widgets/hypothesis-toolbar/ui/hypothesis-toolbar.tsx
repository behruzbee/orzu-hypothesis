import { useState } from 'react'
import { Search, Filter, ArrowUpDown, Plus, Check } from 'lucide-react'
import { useHypothesisStore } from '@renderer/shared/store/use-hypothesis-store'
import { useAuthStore } from '@renderer/shared/store/use-auth-store'

interface Props {
  onCreateClick?: () => void
}

export const HypothesisToolbar = ({ onCreateClick }: Props) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)

  // 1. Достаем полный список сотрудников из БД
  const users = useAuthStore((state) => state.users)

  // 2. Достаем методы и стейты для фильтрации гипотез
  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filterAssignee,
    setFilterAssignee
  } = useHypothesisStore()

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex gap-4 flex-1">
        
        {/* Поиск */}
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск гипотез..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-orzu focus:ring-1 focus:ring-orzu"
          />
        </div>

        {/* Фильтр по сотрудникам */}
        <div className="relative">
          <button
            onClick={() => {
              setIsFilterOpen(!isFilterOpen)
              setIsSortOpen(false)
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer border ${filterAssignee !== 'all' ? 'bg-green-50 text-orzu border-green-200' : 'text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
          >
            <Filter size={18} />
            <span className="font-medium">
              {filterAssignee === 'all' ? 'Все авторы' : filterAssignee}
            </span>
          </button>

          {isFilterOpen && (
            <>
              {/* Невидимый слой на весь экран для закрытия меню по клику вне его */}
              <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
              <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-2">
                <div className="px-3 pb-2 mb-2 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Сотрудники ({users.length})
                </div>
                
                <SortOptionBtn
                  current={filterAssignee}
                  value="all"
                  label="Все авторы"
                  onClick={() => {
                    setFilterAssignee('all')
                    setIsFilterOpen(false)
                  }}
                />
                
                {/* Рендерим реальных сотрудников из базы данных */}
                {users.map((user) => (
                  <SortOptionBtn
                    key={user.id}
                    current={filterAssignee}
                    value={user.username}
                    label={user.username}
                    onClick={() => {
                      setFilterAssignee(user.username)
                      setIsFilterOpen(false)
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Сортировка */}
        <div className="relative">
          <button
            onClick={() => {
              setIsSortOpen(!isSortOpen)
              setIsFilterOpen(false)
            }}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <ArrowUpDown size={18} /> <span className="font-medium">Сортировка</span>
          </button>

          {isSortOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)} />
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-2">
                <SortOptionBtn
                  current={sortBy}
                  value="newest"
                  label="Сначала новые"
                  onClick={(v: any) => {
                    setSortBy(v)
                    setIsSortOpen(false)
                  }}
                />
                <SortOptionBtn
                  current={sortBy}
                  value="oldest"
                  label="Сначала старые"
                  onClick={(v: any) => {
                    setSortBy(v)
                    setIsSortOpen(false)
                  }}
                />
                <SortOptionBtn
                  current={sortBy}
                  value="title-asc"
                  label="Название (А-Я)"
                  onClick={(v: any) => {
                    setSortBy(v)
                    setIsSortOpen(false)
                  }}
                />
                <SortOptionBtn
                  current={sortBy}
                  value="title-desc"
                  label="Название (Я-А)"
                  onClick={(v: any) => {
                    setSortBy(v)
                    setIsSortOpen(false)
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {onCreateClick && (
        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 px-5 py-2 bg-orzu text-white font-medium rounded-lg hover:brightness-110 shadow-md shadow-orzu/20 cursor-pointer"
        >
          <Plus size={20} /> Создать гипотезу
        </button>
      )}
    </div>
  )
}

const SortOptionBtn = ({ current, value, label, onClick }: any) => (
  <button
    onClick={() => onClick(value)}
    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center justify-between cursor-pointer"
  >
    {label}
    {current === value && <Check size={16} className="text-orzu" />}
  </button>
)
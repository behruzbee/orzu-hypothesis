import { useState, useMemo } from 'react'
import { useHypothesisStore } from '@renderer/shared/store/use-hypothesis-store'
import { HypothesisStatus } from '@renderer/shared/types/hypothesis'
import { Target, TrendingUp, Clock, Activity, Users } from 'lucide-react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'

// Константы для фильтров времени
const PERIODS = {
  all: 'За всё время',
  '7d': 'За последние 7 дней',
  '30d': 'За последние 30 дней',
}

// Переводы статусов для отображения
const STATUS_LABELS = {
  [HypothesisStatus.IDEAS]: 'Идеи',
  [HypothesisStatus.READY]: 'Готовы к тесту',
  [HypothesisStatus.PROGRESS]: 'В процессе',
  [HypothesisStatus.SUCCESS]: 'Успешно',
  [HypothesisStatus.FAILED]: 'Провалено',
  [HypothesisStatus.DISCUSS]: 'Обсуждение',
}

// Цвета для статусов
const STATUS_COLORS = {
  [HypothesisStatus.IDEAS]: '#cbd5e1', // slate-300
  [HypothesisStatus.READY]: '#94a3b8', // slate-400
  [HypothesisStatus.PROGRESS]: '#3b82f6', // blue-500
  [HypothesisStatus.SUCCESS]: '#22c55e', // green-500
  [HypothesisStatus.FAILED]: '#ef4444', // red-500
  [HypothesisStatus.DISCUSS]: '#f97316', // orange-500
}

const PRIORITY_COLORS = {
  high: '#ef4444', // red
  medium: '#f97316', // orange
  low: '#22c55e', // green
  undefined: '#cbd5e1'
}

export const StatsPage = () => {
  const hypotheses = useHypothesisStore((state) => state.hypotheses)

  const [period, setPeriod] = useState<keyof typeof PERIODS>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all')

  const uniqueAssignees = useMemo(() => {
    const set = new Set(hypotheses.map(h => h.assignee).filter(Boolean))
    return Array.from(set) as string[]
  }, [hypotheses])

  const filteredData = useMemo(() => {
    const now = Date.now()
    return hypotheses.filter(h => {
      if (assigneeFilter !== 'all' && h.assignee !== assigneeFilter) return false
      if (period === '7d' && now - h.createdAt > 7 * 86400000) return false
      if (period === '30d' && now - h.createdAt > 30 * 86400000) return false
      return true
    })
  }, [hypotheses, period, assigneeFilter])

  const stats = useMemo(() => {
    const total = filteredData.length
    
    const finished = filteredData.filter(h => h.status === HypothesisStatus.SUCCESS || h.status === HypothesisStatus.FAILED)
    const successCount = finished.filter(h => h.status === HypothesisStatus.SUCCESS).length
    const successRate = finished.length > 0 ? Math.round((successCount / finished.length) * 100) : 0

    const tested = filteredData.filter(h => h.durationValue)
    let totalHours = 0
    tested.forEach(h => {
      totalHours += h.durationUnit === 'days' ? (h.durationValue || 0) * 24 : (h.durationValue || 0)
    })
    const avgDays = tested.length > 0 ? (totalHours / tested.length / 24).toFixed(1) : '0'

    // РУССКИЕ СТАТУСЫ ЗДЕСЬ:
    const byStatus = Object.values(HypothesisStatus).map(status => ({
      name: STATUS_LABELS[status], // Берем название из словаря
      value: filteredData.filter(h => h.status === status).length,
      color: STATUS_COLORS[status]
    })).filter(item => item.value > 0)

    const byPriority = ['high', 'medium', 'low'].map(p => ({
      name: p === 'high' ? 'Высокий' : p === 'medium' ? 'Средний' : 'Низкий',
      value: filteredData.filter(h => h.priority === p).length,
      color: PRIORITY_COLORS[p as keyof typeof PRIORITY_COLORS]
    })).filter(item => item.value > 0)

    const byAudienceMap: Record<string, number> = {}
    filteredData.forEach(h => {
      const aud = h.targetAudience || 'Не указано'
      byAudienceMap[aud] = (byAudienceMap[aud] || 0) + 1
    })
    const byAudience = Object.entries(byAudienceMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    const authorMap: Record<string, number> = {}
    filteredData.forEach(h => {
      if (h.assignee) authorMap[h.assignee] = (authorMap[h.assignee] || 0) + 1
    })
    const topAuthors = Object.entries(authorMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    return { total, successRate, avgDays, byStatus, byPriority, byAudience, topAuthors }
  }, [filteredData])


  return (
    <div className="flex flex-col gap-6 h-full p-2 overflow-y-auto">
      
      {/* HEADER И ФИЛЬТРЫ */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Activity className="text-orzu" /> Аналитика гипотез
          </h1>
          <p className="text-sm text-slate-500">Обзор эффективности работы продуктовой команды</p>
        </div>
        
        <div className="flex gap-4">
          <select 
            value={assigneeFilter} 
            onChange={e => setAssigneeFilter(e.target.value)}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-700 focus:border-orzu"
          >
            <option value="all">Все авторы</option>
            {uniqueAssignees.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          <select 
            value={period} 
            onChange={e => setPeriod(e.target.value as any)}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm text-slate-700 focus:border-orzu"
          >
            {Object.entries(PERIODS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI КАРТОЧКИ */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 relative overflow-hidden">
          <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0">
            <Target size={28} />
          </div>
          <div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Всего гипотез</p>
            <p className="text-4xl font-black text-slate-800">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center shrink-0">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Win Rate</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-slate-800">{stats.successRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center shrink-0">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Ср. время теста</p>
            <p className="text-4xl font-black text-slate-800">{stats.avgDays} <span className="text-lg text-slate-400">дн.</span></p>
          </div>
        </div>
      </div>

      {/* ГРАФИКИ */}
      <div className="grid grid-cols-2 gap-6 pb-10">
        
        {/* Статусы */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Распределение по статусам</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.byStatus} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {stats.byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            {stats.byStatus.map(s => (
              <div key={s.name} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></div>
                {s.name} ({s.value})
              </div>
            ))}
          </div>
        </div>

        {/* Приоритеты */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Распределение по приоритету</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byPriority} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={32}>
                  {stats.byPriority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {assigneeFilter === 'all' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Users size={18} className="text-orzu"/> Топ генераторов идей</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topAuthors}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#64748b' }} dy={10} />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" fill="#238C00" radius={[8, 8, 0, 0]} barSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
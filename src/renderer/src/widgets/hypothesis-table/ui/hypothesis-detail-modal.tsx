// @renderer/widgets/hypothesis-table/ui/hypothesis-detail-modal.tsx
import { motion, AnimatePresence } from 'framer-motion'
import { X, Target, Users, User, Calendar, MessageSquare, FileText, Activity } from 'lucide-react'
import { Hypothesis } from '@renderer/shared/types/hypothesis'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts'

interface Props {
  hypothesis: Hypothesis | null
  onClose: () => void
}

export const HypothesisDetailModal = ({ hypothesis, onClose }: Props) => {
  if (!hypothesis) return null

  // УМНОЕ ФОРМИРОВАНИЕ ГРАФИКА (С Точкой А)
  const buildChartData = () => {
    const data: any[] = []

    // 1. Добавляем Точку А (Старт)
    if (hypothesis.pointA !== undefined) {
      const startDate = hypothesis.startedAt || hypothesis.createdAt
      data.push({
        name: new Date(startDate).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
        value: hypothesis.pointA,
        timestamp: startDate,
        isStart: true // Помечаем, чтобы в тултипе можно было красиво вывести
      })
    }

    // 2. Добавляем историю замеров (Факт)
    if (hypothesis.progressHistory && hypothesis.progressHistory.length > 0) {
      const historyPoints = hypothesis.progressHistory.map(record => ({
        name: new Date(record.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
        value: record.value,
        timestamp: record.date
      }))
      data.push(...historyPoints)
    }

    // 3. Сортируем всё по времени (чтобы график шел слева направо)
    return data.sort((a, b) => a.timestamp - b.timestamp)
  }

  const chartData = buildChartData()
  // Показываем график, только если есть Точка А + хотя бы один замер (чтобы была линия, а не просто одна точка)
  const showChart = chartData.length > 1 

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          className="w-[600px] max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ШАПКА */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
            <div>
              <span className="inline-block px-2 py-1 bg-orzu/10 text-orzu text-[10px] font-bold uppercase rounded-md mb-3">
                Детали гипотезы
              </span>
              <h3 className="font-bold text-slate-800 text-xl leading-tight">{hypothesis.title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-red-500 transition shrink-0 cursor-pointer"
            >
              <X size={24} />
            </button>
          </div>

          {/* КОНТЕНТ */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            
            {/* План и Факт */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">
                  Ожидалось (План)
                </h4>
                <span className="font-mono font-bold text-slate-600 text-lg">
                  {hypothesis.pointA || 0} → {hypothesis.pointB || 0}
                </span>
              </div>
              <div className="text-right">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">
                  Фактический результат
                </h4>
                <span className="font-mono font-black text-orzu text-2xl">
                  {hypothesis.actualPointB ?? 'В процессе'}
                </span>
              </div>
            </div>

            {/* ГРАФИК */}
            {showChart && (
              <div className="border border-slate-100 rounded-xl p-4">
                <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mb-4">
                  <Activity size={14} /> Динамика метрики
                </h4>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 10, fill: '#94a3b8' }} 
                        axisLine={false} 
                        tickLine={false} 
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fill: '#94a3b8' }} 
                        axisLine={false} 
                        tickLine={false} 
                        // Даем немного отступа сверху и снизу на графике, чтобы линия не прилипала к краям
                        domain={['auto', 'auto']}
                      />
                      
                      {/* Кастомный Tooltip, чтобы писать "Старт" возле Точки А */}
                      <RechartsTooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const dataPoint = payload[0].payload
                            return (
                              <div className="bg-white p-2 border border-slate-100 shadow-lg rounded-xl">
                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                                  {dataPoint.isStart ? 'Старт (Точка А)' : label}
                                </p>
                                <p className="text-orzu font-mono font-bold text-sm">
                                  {dataPoint.value}
                                </p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />

                      {/* Линия Точки Б (Цель) */}
                      {hypothesis.pointB && (
                        <ReferenceLine 
                          y={hypothesis.pointB} 
                          stroke="#cbd5e1" 
                          strokeDasharray="4 4" 
                          label={{ position: 'top', value: 'Цель', fill: '#94a3b8', fontSize: 10 }} 
                        />
                      )}
                      
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#16a34a" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#16a34a', strokeWidth: 2, stroke: '#fff' }} 
                        activeDot={{ r: 6 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Метрики и Аудитория */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-slate-100 rounded-xl">
                <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mb-1">
                  <Target size={14} /> Метрика
                </h4>
                <p className="font-bold text-slate-700 text-sm">{hypothesis.metricName || '—'}</p>
              </div>
              <div className="p-4 border border-slate-100 rounded-xl">
                <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mb-1">
                  <Users size={14} /> Аудитория
                </h4>
                <p className="font-bold text-slate-700 text-sm">{hypothesis.targetAudience || '—'}</p>
              </div>
            </div>

            {/* Описание */}
            <div>
              <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mb-2">
                <FileText size={14} /> Описание
              </h4>
              <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
                {hypothesis.description || (
                  <span className="italic text-slate-400">Описание отсутствует...</span>
                )}
              </p>
            </div>

            {/* Выводы / Комментарии */}
            {hypothesis.resultComment && (
              <div>
                <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mb-2">
                  <MessageSquare size={14} /> Выводы по эксперименту
                </h4>
                <p className="text-sm text-slate-700 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                  {hypothesis.resultComment}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <User size={14} /> Автор: {hypothesis.assignee || 'Не назначен'}
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} /> Создано:{' '}
                {new Date(hypothesis.createdAt).toLocaleDateString('ru-RU')}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
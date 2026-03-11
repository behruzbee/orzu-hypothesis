import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp } from 'lucide-react'
import { useHypothesisStore } from '@renderer/shared/store/use-hypothesis-store'
import { FormSelect } from '@renderer/shared/ui/form-select'
import { METRIC_OPTIONS, AUDIENCE_OPTIONS } from '@renderer/shared/constants/hypothesis-options'

interface Props {
  hypothesisId: string | null
  onClose: () => void
}

export const AcceptHypothesisModal = ({ hypothesisId, onClose }: Props) => {
  const acceptHypothesis = useHypothesisStore((state) => state.acceptHypothesis)

  // Значения по умолчанию
  const [metric, setMetric] = useState(METRIC_OPTIONS[0].value)
  const [audience, setAudience] = useState(AUDIENCE_OPTIONS[0].value)
  const [customAudience, setCustomAudience] = useState('')
  
  // Разрешаем стейту быть строкой, чтобы можно было "стереть" 0
  const [pointA, setPointA] = useState<number | string>(0)
  const [pointB, setPointB] = useState<number | string>(0)

  if (!hypothesisId) return null

  // Приводим к числу для расчетов
  const numA = Number(pointA) || 0
  const numB = Number(pointB) || 0

  // Расчет роста
  const growth = numB > numA ? ((numB - numA) / (numA || 1)) * 100 : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    acceptHypothesis(hypothesisId, {
      metricName: metric,
      targetAudience: audience === 'custom' ? customAudience : audience,
      pointA: numA,
      pointB: numB
    })
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Шапка */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Запустить эксперимент</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-red-500 cursor-pointer transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            
            <FormSelect 
              label="Метрика успеха"
              options={METRIC_OPTIONS}
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
            />

            <div className="flex flex-col gap-1.5">
              <FormSelect 
                label="Целевая аудитория"
                options={AUDIENCE_OPTIONS}
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
              
              <AnimatePresence>
                {audience === 'custom' && (
                  <motion.input
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    type="text"
                    placeholder="Укажите свою группу пользователей..."
                    className="mt-1 p-2.5 border border-slate-300 rounded-lg outline-none focus:border-orzu transition-all"
                    onChange={(e) => setCustomAudience(e.target.value)}
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700">Точка А (Сейчас)</label>
                <input
                  type="number"
                  value={pointA}
                  // Если поле пустое, сохраняем пустую строку, иначе число
                  onChange={(e) => setPointA(e.target.value === '' ? '' : Number(e.target.value))}
                  onFocus={(e) => e.target.select()} // Удобство: выделяет текст при клике
                  className="p-2.5 border border-slate-300 rounded-lg outline-none focus:border-orzu transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700">Точка Б (Цель)</label>
                <input
                  type="number"
                  value={pointB}
                  onChange={(e) => setPointB(e.target.value === '' ? '' : Number(e.target.value))}
                  onFocus={(e) => e.target.select()}
                  className="p-2.5 border border-slate-300 rounded-lg outline-none focus:border-orzu transition-all"
                />
              </div>
            </div>

            {/* Блок визуализации роста */}
            <div className="mt-2 p-5 bg-green-50 rounded-2xl border border-green-100 relative overflow-hidden group">
              <div className="flex justify-between items-end relative z-10">
                <div>
                  <div className="text-[10px] uppercase font-black text-green-600 tracking-widest">
                    Прогноз роста
                  </div>
                  <motion.div 
                    key={growth}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-4xl font-black text-orzu"
                  >
                    +{growth.toFixed(1)}%
                  </motion.div>
                </div>
                <TrendingUp size={48} className="text-orzu/10 group-hover:scale-110 transition-transform" />
              </div>
              
              <div className="absolute bottom-0 left-0 w-full h-1.5 bg-green-200/30">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(growth, 100)}%` }}
                  className="h-full bg-orzu shadow-[0_0_10px_rgba(35,140,0,0.5)]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-orzu text-white font-bold rounded-xl shadow-lg shadow-orzu/20 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer mt-2"
            >
              Подтвердить и запустить
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
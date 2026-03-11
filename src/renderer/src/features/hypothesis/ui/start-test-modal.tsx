import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Calendar, Zap, AlertCircle } from 'lucide-react'
import { useHypothesisStore } from '@renderer/shared/store/use-hypothesis-store'
import { HypothesisPriority } from '@renderer/shared/types/hypothesis'

interface Props {
  hypothesisId: string | null
  onClose: () => void
}

export const StartTestModal = ({ hypothesisId, onClose }: Props) => {
  const startTest = useHypothesisStore((state) => state.startTest)
  const [val, setVal] = useState<number | string>(7)
  const [unit, setUnit] = useState<'hours' | 'days'>('days')
  
  // Стейт для приоритета (по умолчанию - средний)
  const [priority, setPriority] = useState<HypothesisPriority>('medium')

  if (!hypothesisId) return null

  const handleConfirm = () => {
    const numericVal = Number(val)
    if (numericVal > 0) {
      // Передаем приоритет в стор
      startTest(hypothesisId, numericVal, unit, priority)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="w-[380px] bg-white rounded-3xl p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Zap size={20} className="text-orzu fill-orzu/20" /> Параметры запуска</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors p-1"><X size={20} /></button>
          </div>

          <div className="flex flex-col gap-6">
            
            {/* 1. Блок выбора приоритета */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <AlertCircle size={14} /> Приоритет
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPriority('low')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border-2 ${priority === 'low' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-transparent border-slate-100 text-slate-400 hover:border-green-200'}`}
                >
                  Низкий
                </button>
                <button
                  onClick={() => setPriority('medium')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border-2 ${priority === 'medium' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-transparent border-slate-100 text-slate-400 hover:border-orange-200'}`}
                >
                  Средний
                </button>
                <button
                  onClick={() => setPriority('high')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border-2 ${priority === 'high' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-transparent border-slate-100 text-slate-400 hover:border-red-200'}`}
                >
                  Высокий
                </button>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* 2. Блок выбора времени (остался без изменений) */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Срок проведения</label>
              <div className="flex p-1 bg-slate-100 rounded-xl mb-3">
                <button onClick={() => { setUnit('hours'); setVal(24); }} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${unit === 'hours' ? 'bg-white text-orzu shadow-sm' : 'text-slate-400'}`}><Clock size={16}/> Часы</button>
                <button onClick={() => { setUnit('days'); setVal(7); }} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${unit === 'days' ? 'bg-white text-orzu shadow-sm' : 'text-slate-400'}`}><Calendar size={16}/> Дни</button>
              </div>

              <div className="relative">
                <input 
                  type="number" 
                  value={val} 
                  onChange={e => setVal(e.target.value === '' ? '' : Number(e.target.value))}
                  onFocus={e => e.target.select()}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black text-slate-800 outline-none focus:border-orzu transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  {unit === 'days' ? 'дней' : 'часов'}
                </span>
              </div>
            </div>

            <button 
              onClick={handleConfirm}
              className="w-full py-4 bg-orzu text-white font-black rounded-2xl shadow-lg shadow-orzu/30 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer tracking-wider"
            >
              СТАРТ ТЕСТА
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
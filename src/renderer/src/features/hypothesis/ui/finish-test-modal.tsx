// src/renderer/src/features/hypothesis/ui/finish-test-modal.tsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, XCircle, MessageCircle } from 'lucide-react'
import { useHypothesisStore } from '@renderer/shared/store/use-hypothesis-store'
import { HypothesisStatus } from '@renderer/shared/types/hypothesis'

interface Props {
  hypothesisId: string | null
  onClose: () => void
}

export const FinishTestModal = ({ hypothesisId, onClose }: Props) => {
  const finishTest = useHypothesisStore((state) => state.finishTest)
  const hypothesis = useHypothesisStore((state) => 
    state.hypotheses.find(h => h.id === hypothesisId)
  )

  const [actualB, setActualB] = useState<number | string>('')
  const [comment, setComment] = useState('')
  
  // Изменили стейт на хранение конкретного статуса
  const [finalStatus, setFinalStatus] = useState<
    HypothesisStatus.SUCCESS | HypothesisStatus.FAILED | HypothesisStatus.DISCUSS | null
  >(null)

  useEffect(() => {
    if (hypothesis?.pointA) setActualB(hypothesis.pointA)
  }, [hypothesis])

  if (!hypothesisId || !hypothesis) return null

  const handleConfirm = () => {
    if (finalStatus !== null) {
      finishTest(hypothesisId, Number(actualB), comment, finalStatus)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
          // Сделали окно чуть шире, чтобы влезли 3 кнопки
          className="w-[500px] bg-white rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800 text-lg">Завершение эксперимента</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition"><X size={20} /></button>
          </div>

          <div className="p-6 flex flex-col gap-5">
            {/* Блок Ожиданий */}
            <div className="flex justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Ожидалось (План)</p>
                <p className="font-bold text-slate-700">{hypothesis.pointA} → {hypothesis.pointB}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400">Метрика</p>
                <p className="font-bold text-orzu">{hypothesis.metricName}</p>
              </div>
            </div>

            {/* Ввод факта */}
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1">Фактический результат (Точка Б)</label>
              <input
                type="number"
                value={actualB}
                onChange={(e) => setActualB(e.target.value === '' ? '' : Number(e.target.value))}
                onFocus={(e) => e.target.select()}
                className="w-full p-3 bg-white border border-slate-300 rounded-xl outline-none focus:border-orzu focus:ring-2 focus:ring-orzu/20 text-lg font-bold transition-all"
                placeholder="Например: 15"
              />
            </div>

            {/* ВЫБОР ИТОГА (3 КНОПКИ) */}
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">Решение по гипотезе</label>
              <div className="flex gap-2">
                
                {/* Кнопка Успех */}
                <button
                  onClick={() => setFinalStatus(HypothesisStatus.SUCCESS)}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 p-3 border-2 rounded-xl transition-all ${finalStatus === HypothesisStatus.SUCCESS ? 'border-green-500 bg-green-50 text-green-600 shadow-sm' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                >
                  <CheckCircle size={22} />
                  <span className="font-bold text-[11px] uppercase tracking-wider">Успешно</span>
                </button>
                
                {/* Кнопка Обсудить */}
                <button
                  onClick={() => setFinalStatus(HypothesisStatus.DISCUSS)}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 p-3 border-2 rounded-xl transition-all ${finalStatus === HypothesisStatus.DISCUSS ? 'border-orange-400 bg-orange-50 text-orange-600 shadow-sm' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                >
                  <MessageCircle size={22} />
                  <span className="font-bold text-[11px] uppercase tracking-wider">Обсудить</span>
                </button>

                {/* Кнопка Провал */}
                <button
                  onClick={() => setFinalStatus(HypothesisStatus.FAILED)}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 p-3 border-2 rounded-xl transition-all ${finalStatus === HypothesisStatus.FAILED ? 'border-red-500 bg-red-50 text-red-500 shadow-sm' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                >
                  <XCircle size={22} />
                  <span className="font-bold text-[11px] uppercase tracking-wider">Провалено</span>
                </button>

              </div>
            </div>

            {/* Комментарий */}
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-1">Комментарий / Инсайты</label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Напишите выводы..."
                className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-orzu resize-none"
              />
            </div>

            <button
              disabled={finalStatus === null}
              onClick={handleConfirm}
              className={`w-full py-4 font-bold rounded-xl text-white transition-all ${finalStatus === null ? 'bg-slate-300 cursor-not-allowed' : 'bg-orzu shadow-lg shadow-orzu/20 hover:brightness-110 active:scale-95'}`}
            >
              СОХРАНИТЬ РЕЗУЛЬТАТ
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
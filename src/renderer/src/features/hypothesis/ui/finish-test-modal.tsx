// src/renderer/src/features/hypothesis/ui/finish-test-modal.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, XCircle, MessageCircle, Plus, Calendar, Trash2, ArrowRight } from 'lucide-react'
import { useHypothesisStore } from '@renderer/shared/store/use-hypothesis-store'
import { HypothesisStatus } from '@renderer/shared/types/hypothesis'

interface Props {
  hypothesisId: string | null
  onClose: () => void
}

export const FinishTestModal = ({ hypothesisId, onClose }: Props) => {
  const { finishTest, addProgressRecord, removeProgressRecord, hypotheses } = useHypothesisStore()
  const hypothesis = hypotheses.find(h => h.id === hypothesisId)

  const [comment, setComment] = useState('')
  const [finalStatus, setFinalStatus] = useState<HypothesisStatus.SUCCESS | HypothesisStatus.FAILED | HypothesisStatus.DISCUSS | null>(null)

  const [progressValue, setProgressValue] = useState<number | string>('')
  const [progressDate, setProgressDate] = useState(() => new Date().toISOString().split('T')[0])
  const [isAddingProgress, setIsAddingProgress] = useState(false)

  if (!hypothesisId || !hypothesis) return null

  // УМНАЯ ЛОГИКА: Берем самый последний замер по дате
  const sortedHistory = [...(hypothesis.progressHistory || [])].sort((a, b) => a.date - b.date)
  const latestRecord = sortedHistory.length > 0 ? sortedHistory[sortedHistory.length - 1] : null
  const finalActualB = latestRecord ? latestRecord.value : null

  const handleConfirm = () => {
    if (finalStatus !== null && finalActualB !== null) {
      finishTest(hypothesisId, Number(finalActualB), comment, finalStatus)
      onClose()
    }
  }

  const handleAddProgress = async () => {
    // Проверяем, что введено именно число и дата не пустая
    if (progressValue !== '' && !isNaN(Number(progressValue)) && progressDate !== '') {
        setIsAddingProgress(true)
        const timestamp = new Date(progressDate).getTime()
        
        await addProgressRecord(hypothesisId, { 
            value: Number(progressValue), 
            date: timestamp
        })
        
        // Очищаем поле только после успешного добавления
        setProgressValue('')
        setIsAddingProgress(false)
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
          className="w-[550px] max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl shrink-0">
            <h3 className="font-bold text-slate-800 text-lg">Эксперимент в процессе</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition"><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Ожидалось (План)</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-sm">{hypothesis.pointA}</span>
                  <ArrowRight size={14} className="text-slate-400" />
                  <span className="font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-sm text-orzu font-bold">{hypothesis.pointB}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Метрика</p>
                <span className="bg-orzu/10 text-orzu px-2 py-1 rounded-md text-xs font-bold">{hypothesis.metricName}</span>
              </div>
            </div>

            {/* БЛОК ИСТОРИИ И ПРОМЕЖУТОЧНЫХ РЕЗУЛЬТАТОВ */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Calendar size={16} className="text-orzu" /> Замеры метрики
                </h4>
                
                {sortedHistory.length > 0 ? (
                    <div className="flex flex-col gap-2 mb-4 max-h-[150px] overflow-y-auto pr-2">
                        {sortedHistory.map((record, index) => {
                            const isLast = index === sortedHistory.length - 1;
                            return (
                                <div key={record.id} className={`group flex justify-between items-center p-2.5 bg-white rounded-lg border text-sm transition-colors ${isLast ? 'border-orzu/30 shadow-sm' : 'border-slate-100 hover:border-slate-200'}`}>
                                    <div className="flex items-center gap-3">
                                      {isLast && <span className="flex h-2 w-2 rounded-full bg-orzu shrink-0"></span>}
                                      <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                          <span className={`font-mono font-bold ${isLast ? 'text-orzu text-base' : 'text-slate-600'}`}>{record.value}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                                            {new Date(record.date).toLocaleDateString('ru-RU')}
                                        </span>
                                        <button 
                                            onClick={() => removeProgressRecord(hypothesis.id, record.id)}
                                            className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                            title="Удалить замер"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <p className="text-xs text-slate-400 mb-4 italic">Добавьте первый замер, чтобы зафиксировать результат.</p>
                )}

                <div className="flex gap-2">
                    <input 
                        type="date" 
                        value={progressDate}
                        onChange={e => setProgressDate(e.target.value)}
                        className="w-[125px] p-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-orzu font-medium text-slate-600"
                    />
                    <input 
                        type="number" 
                        placeholder="Введите значение..." 
                        value={progressValue}
                        onChange={e => setProgressValue(e.target.value)}
                        className="flex-1 p-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-orzu font-bold text-slate-700"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddProgress()
                        }}
                    />
               
                    <button 
                        onClick={handleAddProgress}
                        disabled={progressValue === '' || progressDate === '' || isAddingProgress}
                        className="px-4 bg-slate-200 text-slate-600 rounded-lg hover:bg-orzu hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        <Plus size={18} />
                    </button>
                </div>
            </div>

            <hr className="border-slate-100" />

            {/* БЛОК ФИНАЛЬНОГО ЗАВЕРШЕНИЯ */}
            <div className="flex flex-col gap-4">
                <h4 className="font-black text-slate-800 uppercase tracking-wide text-sm">Решение по эксперименту</h4>
                
                {/* АВТОМАТИЧЕСКИЙ ФИНАЛЬНЫЙ РЕЗУЛЬТАТ */}
                <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-sm font-bold text-slate-700">Итоговый факт (Точка Б):</span>
                    {finalActualB !== null ? (
                        <span className="text-lg font-black text-orzu font-mono">{finalActualB}</span>
                    ) : (
                        <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-1 rounded">Сначала добавьте замер ☝️</span>
                    )}
                </div>

                <div>
                  <div className="flex gap-2">
                      <button onClick={() => setFinalStatus(HypothesisStatus.SUCCESS)} className={`flex-1 flex flex-col items-center justify-center gap-1 p-3 border-2 rounded-xl transition-all cursor-pointer ${finalStatus === HypothesisStatus.SUCCESS ? 'border-green-500 bg-green-50 text-green-600 shadow-sm' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                      <CheckCircle size={22} /><span className="font-bold text-[11px] uppercase">Успешно</span>
                      </button>
                      <button onClick={() => setFinalStatus(HypothesisStatus.DISCUSS)} className={`flex-1 flex flex-col items-center justify-center gap-1 p-3 border-2 rounded-xl transition-all cursor-pointer ${finalStatus === HypothesisStatus.DISCUSS ? 'border-orange-400 bg-orange-50 text-orange-600 shadow-sm' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                      <MessageCircle size={22} /><span className="font-bold text-[11px] uppercase">Обсудить</span>
                      </button>
                      <button onClick={() => setFinalStatus(HypothesisStatus.FAILED)} className={`flex-1 flex flex-col items-center justify-center gap-1 p-3 border-2 rounded-xl transition-all cursor-pointer ${finalStatus === HypothesisStatus.FAILED ? 'border-red-500 bg-red-50 text-red-500 shadow-sm' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                      <XCircle size={22} /><span className="font-bold text-[11px] uppercase">Провалено</span>
                      </button>
                  </div>
                </div>

                <div>
                  <textarea
                      rows={2}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Краткие выводы / инсайты по эксперименту..."
                      className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:border-orzu resize-none text-sm"
                  />
                </div>
            </div>
          </div>
          
          <div className="p-5 border-t border-slate-100 bg-slate-50 shrink-0">
             <button
              disabled={finalStatus === null || finalActualB === null}
              onClick={handleConfirm}
              className={`w-full py-4 font-bold rounded-xl text-white transition-all cursor-pointer ${finalStatus === null || finalActualB === null ? 'bg-slate-300 cursor-not-allowed' : 'bg-orzu shadow-lg shadow-orzu/20 hover:brightness-110 active:scale-95'}`}
            >
              ЗАВЕРШИТЬ ТЕСТ И СОХРАНИТЬ
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
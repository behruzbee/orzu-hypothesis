// src/renderer/src/features/hypothesis/ui/create-hypothesis-modal.tsx
import { useState, useEffect } from 'react'
import { X, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHypothesisStore } from '@renderer/shared/store/use-hypothesis-store'
import { useAuthStore } from '@renderer/shared/store/use-auth-store'

interface Props {
  isOpen: boolean
  onClose: () => void
}

interface LocalForm {
  id: number
  title: string
  description: string
  assignee: string
  showDetails: boolean
}

export const CreateHypothesisModal = ({ isOpen, onClose }: Props) => {
  const addHypotheses = useHypothesisStore((state) => state.addHypotheses)
  
  // Получаем список пользователей и имя текущего авторизованного
  const { users, username: currentUsername } = useAuthStore()

  const [forms, setForms] = useState<LocalForm[]>([])

  useEffect(() => {
    if (isOpen) {
      setForms([{ id: Date.now(), title: '', description: '', assignee: '', showDetails: false }])
    }
  }, [isOpen])

  const updateForm = (id: number, field: keyof LocalForm, value: string | boolean) => {
    setForms(forms.map((f) => (f.id === id ? { ...f, [field]: value } : f)))
  }

  const addMore = () => {
    setForms([
      ...forms,
      { id: Date.now(), title: '', description: '', assignee: '', showDetails: false }
    ])
  }

  const removeForm = (id: number) => {
    if (forms.length > 1) {
      setForms(forms.filter((f) => f.id !== id))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newHypotheses = forms
      .filter((form) => form.title.trim() !== '')
      .map((form) => ({
        title: form.title,
        description: form.description,
        // Если ничего не выбрано, ставим текущего пользователя
        assignee: form.assignee || currentUsername || 'Аноним'
      }))

    if (newHypotheses.length > 0) {
      addHypotheses(newHypotheses)
    }

    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.3 }}
            className="w-[600px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50 rounded-t-2xl shrink-0">
              <h2 className="text-lg font-bold text-slate-800">Создать гипотезы</h2>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                {forms.map((form, index) => (
                  <div
                    key={form.id}
                    className="flex flex-col gap-4 p-5 bg-slate-50 border border-slate-200 rounded-xl relative"
                  >
                    {forms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeForm(form.id)}
                        className="absolute top-3 right-3 text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}

                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                      Гипотеза #{index + 1}
                    </h3>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-700">
                        Название <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        autoFocus={index === 0}
                        value={form.title}
                        onChange={(e) => updateForm(form.id, 'title', e.target.value)}
                        placeholder="Например: Добавление темной темы..."
                        className="px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-orzu focus:ring-1 focus:ring-orzu"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => updateForm(form.id, 'showDetails', !form.showDetails)}
                      className="flex items-center gap-1 text-sm font-medium text-orzu hover:text-green-700 transition-colors w-fit cursor-pointer"
                    >
                      {form.showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      {form.showDetails ? 'Скрыть подробности' : 'Добавить подробности'}
                    </button>
                    
                    <div className={`flex-col gap-4 ${form.showDetails ? 'flex' : 'hidden'}`}>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-700">Описание</label>
                        <textarea
                          rows={2}
                          value={form.description}
                          onChange={(e) => updateForm(form.id, 'description', e.target.value)}
                          placeholder="Подробности вашей идеи..."
                          className="px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-orzu focus:ring-1 focus:ring-orzu resize-none"
                        />
                      </div>
                      
                      {/* ОБНОВЛЕННОЕ ПОЛЕ "ОТВЕТСТВЕННЫЙ" */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-700">Ответственный</label>
                        <select
                          value={form.assignee}
                          onChange={(e) => updateForm(form.id, 'assignee', e.target.value)}
                          className="px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-orzu focus:ring-1 focus:ring-orzu font-medium text-slate-700 cursor-pointer"
                        >
                          {/* Опция по умолчанию (текущий пользователь) */}
                          <option value="">
                            Я ({currentUsername})
                          </option>
                          
                          {/* Список остальных пользователей */}
                          {users
                            .filter(u => u.username !== currentUsername)
                            .map(u => (
                              <option key={u.id} value={u.username}>
                                {u.username}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addMore}
                  className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 text-slate-500 font-medium rounded-xl hover:bg-slate-50 hover:text-orzu hover:border-orzu transition-all cursor-pointer"
                >
                  <Plus size={20} />
                  Добавить еще гипотезу
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-200 bg-white shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orzu text-white font-medium rounded-lg hover:brightness-110 shadow-md shadow-orzu/20 cursor-pointer"
                >
                  Сохранить {forms.length > 1 ? `все (${forms.length})` : ''}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
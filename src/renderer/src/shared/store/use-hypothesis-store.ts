import { create } from 'zustand'
import { Hypothesis, HypothesisPriority, HypothesisStatus } from '../types/hypothesis'

export type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc'

interface HypothesisStore {
  hypotheses: Hypothesis[]

  searchQuery: string
  sortBy: SortOption
  filterAssignee: string

  setSearchQuery: (query: string) => void
  setSortBy: (sort: SortOption) => void
  setFilterAssignee: (assignee: string) => void

  // 🚀 Новая функция для загрузки данных при входе в систему
  fetchHypotheses: () => Promise<void>

  // Все действия теперь асинхронные
  addHypotheses: (dataArray: Omit<Hypothesis, 'id' | 'createdAt' | 'status'>[]) => Promise<void>
  updateStatus: (id: string, newStatus: Hypothesis['status']) => Promise<void>
  updateField: (id: string, field: keyof Hypothesis, value: any) => Promise<void>
  addProgressRecord: (
    hypothesisId: string,
    record: { value: number; date: number }
  ) => Promise<void>
  removeProgressRecord: (hypothesisId: string, recordId: string) => Promise<void>

  startTest: (
    id: string,
    value: number,
    unit: 'hours' | 'days',
    priority: HypothesisPriority
  ) => Promise<void>
  finishTest: (
    id: string,
    actualPointB: number,
    comment: string,
    finalStatus: HypothesisStatus.SUCCESS | HypothesisStatus.FAILED | HypothesisStatus.DISCUSS
  ) => Promise<void>

  acceptHypothesis: (
    id: string,
    details: { metricName: string; targetAudience: string; pointA: number; pointB: number }
  ) => Promise<void>
}

export const useHypothesisStore = create<HypothesisStore>((set, get) => ({
  hypotheses: [],

  searchQuery: '',
  sortBy: 'newest',
  filterAssignee: 'all',

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setFilterAssignee: (assignee) => set({ filterAssignee: assignee }),

  // ЗАГРУЗКА ИЗ БАЗЫ
  fetchHypotheses: async () => {
    const data = await (window as any).api.readHypotheses()
    set({ hypotheses: data })
  },

  // ДОБАВЛЕНИЕ НОВЫХ ИДЕЙ
  addHypotheses: async (dataArray) => {
    const newItems = dataArray.map((data) => ({
      ...data,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      status: HypothesisStatus.IDEAS
    }))

    // 1. Отправляем в MongoDB
    const res = await (window as any).api.createHypothesis(newItems)

    // 2. Если успешно - добавляем в UI
    if (res.success) {
      set((state) => ({ hypotheses: [...state.hypotheses, ...newItems] as Hypothesis[] }))
    } else {
      console.error(res.error)
    }
  },

  // ИЗМЕНЕНИЕ СТАТУСА
  updateStatus: async (id, newStatus) => {
    const res = await (window as any).api.updateHypothesis({ id, updates: { status: newStatus } })
    if (res.success) {
      set((state) => ({
        hypotheses: state.hypotheses.map((h) => (h.id === id ? { ...h, status: newStatus } : h))
      }))
    }
  },

  // ИЗМЕНЕНИЕ ЛЮБОГО ПОЛЯ (Ячейки таблицы)
  updateField: async (id, field, value) => {
    const res = await (window as any).api.updateHypothesis({ id, updates: { [field]: value } })
    if (res.success) {
      set((state) => ({
        hypotheses: state.hypotheses.map((h) => (h.id === id ? { ...h, [field]: value } : h))
      }))
    }
  },

  // ПРИНЯТЬ В РАБОТУ (Модалка)
  acceptHypothesis: async (id, details) => {
    const updates = { ...details, status: HypothesisStatus.READY }
    const res = await (window as any).api.updateHypothesis({ id, updates })

    if (res.success) {
      set((state) => ({
        hypotheses: state.hypotheses.map((h) => (h.id === id ? { ...h, ...updates } : h))
      }))
    }
  },

  // ЗАПУСТИТЬ ТЕСТ (Модалка)
  startTest: async (id, value, unit, priority) => {
    const updates = {
      durationValue: value,
      durationUnit: unit,
      priority: priority,
      startedAt: Date.now(),
      status: HypothesisStatus.PROGRESS
    }

    const res = await (window as any).api.updateHypothesis({ id, updates })

    if (res.success) {
      set((state) => ({
        hypotheses: state.hypotheses.map((h) => (h.id === id ? { ...h, ...updates } : h))
      }))
    }
  },
  // ПОДВЕСТИ ИТОГИ (Модалка)
  finishTest: async (id, actualPointB, comment, finalStatus) => {
    const updates = {
      actualPointB,
      resultComment: comment,
      status: finalStatus
    }

    const res = await (window as any).api.updateHypothesis({ id, updates })

    if (res.success) {
      set((state) => ({
        hypotheses: state.hypotheses.map((h) => (h.id === id ? { ...h, ...updates } : h))
      }))
    }
  },
  addProgressRecord: async (hypothesisId, record) => {
    const currentHypothesis = get().hypotheses.find((h) => h.id === hypothesisId)
    if (!currentHypothesis) return

    const newRecord = {
      id: crypto.randomUUID(),
      date: record.date,
      value: record.value
    }

    // Сортируем историю по дате (от старых к новым), чтобы график и список выглядели правильно
    const updatedHistory = [...(currentHypothesis.progressHistory || []), newRecord].sort(
      (a, b) => a.date - b.date
    )

    const res = await (window as any).api.updateHypothesis({
      id: hypothesisId,
      updates: { progressHistory: updatedHistory }
    })

    if (res.success) {
      set((state) => ({
        hypotheses: state.hypotheses.map((h) =>
          h.id === hypothesisId ? { ...h, progressHistory: updatedHistory } : h
        )
      }))
    }
  },
  removeProgressRecord: async (hypothesisId, recordId) => {
    const currentHypothesis = get().hypotheses.find((h) => h.id === hypothesisId)
    if (!currentHypothesis || !currentHypothesis.progressHistory) return

    const updatedHistory = currentHypothesis.progressHistory.filter((r) => r.id !== recordId)

    const res = await (window as any).api.updateHypothesis({
      id: hypothesisId,
      updates: { progressHistory: updatedHistory }
    })

    if (res.success) {
      set((state) => ({
        hypotheses: state.hypotheses.map((h) =>
          h.id === hypothesisId ? { ...h, progressHistory: updatedHistory } : h
        )
      }))
    }
  }
}))

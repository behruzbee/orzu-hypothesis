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

  fetchHypotheses: () => Promise<void>
  addHypotheses: (dataArray: Omit<Hypothesis, 'id' | 'createdAt' | 'status' | 'progressHistory'>[]) => Promise<void>
  updateStatus: (id: string, newStatus: Hypothesis['status']) => Promise<void>
  updateField: (id: string, field: keyof Hypothesis, value: any) => Promise<void>
  
  // Обновленная логика работы с историей
  addProgressRecord: (hypothesisId: string, record: { value: number; date: number }) => Promise<void>
  removeProgressRecord: (hypothesisId: string, recordId: string) => Promise<void>

  startTest: (id: string, value: number, unit: 'hours' | 'days', priority: HypothesisPriority) => Promise<void>
  finishTest: (id: string, actualPointB: number, comment: string, finalStatus: HypothesisStatus.SUCCESS | HypothesisStatus.FAILED | HypothesisStatus.DISCUSS) => Promise<void>
  acceptHypothesis: (id: string, details: { metricName: string; targetAudience: string; pointA: number; pointB: number }) => Promise<void>
}

export const useHypothesisStore = create<HypothesisStore>((set, get) => ({
  hypotheses: [],
  searchQuery: '',
  sortBy: 'newest',
  filterAssignee: 'all',

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setFilterAssignee: (assignee) => set({ filterAssignee: assignee }),

  fetchHypotheses: async () => {
    const data = await (window as any).api.readHypotheses()
    set({ hypotheses: data })
  },

  addHypotheses: async (dataArray) => {
    const newItems = dataArray.map((data) => ({
      ...data,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      status: HypothesisStatus.IDEAS,
      progressHistory: [] // Инициализируем пустым массивом
    }))

    const res = await (window as any).api.createHypothesis(newItems)
    if (res.success) {
      set((state) => ({ hypotheses: [...state.hypotheses, ...newItems] }))
    }
  },

  updateField: async (id, field, value) => {
    const res = await (window as any).api.updateHypothesis({ id, updates: { [field]: value } })
    if (res.success) {
      set((state) => ({
        hypotheses: state.hypotheses.map((h) => (h.id === id ? { ...h, [field]: value } : h))
      }))
    }
  },

  // ВАЖНО: Добавление замера в Postgres
  addProgressRecord: async (hypothesisId, record) => {
    const currentHypothesis = get().hypotheses.find((h) => h.id === hypothesisId)
    if (!currentHypothesis) return

    const newRecord = {
      id: crypto.randomUUID(),
      date: record.date,
      value: record.value
    }

    const updatedHistory = [...(currentHypothesis.progressHistory || []), newRecord].sort(
      (a, b) => a.date - b.date
    )

    // Отправляем всю историю. Бэкенд (Prisma) удалит старую и запишет новую
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
  },

  // Остальные методы остаются практически такими же, так как они используют updateHypothesis
  updateStatus: async (id, newStatus) => {
    const res = await (window as any).api.updateHypothesis({ id, updates: { status: newStatus } })
    if (res.success) set((state) => ({ hypotheses: state.hypotheses.map((h) => h.id === id ? { ...h, status: newStatus } : h) }))
  },

  startTest: async (id, value, unit, priority) => {
    const updates = { durationValue: value, durationUnit: unit, priority, startedAt: Date.now(), status: HypothesisStatus.PROGRESS }
    const res = await (window as any).api.updateHypothesis({ id, updates })
    if (res.success) set((state) => ({ hypotheses: state.hypotheses.map((h) => h.id === id ? { ...h, ...updates } : h) }))
  },

  finishTest: async (id, actualPointB, comment, finalStatus) => {
    const updates = { actualPointB, resultComment: comment, status: finalStatus }
    const res = await (window as any).api.updateHypothesis({ id, updates })
    if (res.success) set((state) => ({ hypotheses: state.hypotheses.map((h) => h.id === id ? { ...h, ...updates } : h) }))
  },

  acceptHypothesis: async (id, details) => {
    const updates = { ...details, status: HypothesisStatus.READY }
    const res = await (window as any).api.updateHypothesis({ id, updates })
    if (res.success) set((state) => ({ hypotheses: state.hypotheses.map((h) => h.id === id ? { ...h, ...updates } : h) }))
  }
}))
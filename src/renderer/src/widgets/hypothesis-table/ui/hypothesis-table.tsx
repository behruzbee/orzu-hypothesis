import { useMemo } from 'react'
import { Table } from '@renderer/shared/ui/table'
import { useHypothesisStore } from '@renderer/shared/store/use-hypothesis-store'
import { EmptyState } from '@renderer/shared/ui/empty-state'
import { HypothesisStatus } from '@renderer/shared/types/hypothesis'

interface HypothesisTableProps {
  status: HypothesisStatus
  columns: any[]
}

export const HypothesisTable = ({ status, columns }: HypothesisTableProps) => {
  const { hypotheses, searchQuery, filterAssignee, sortBy, updateField } = useHypothesisStore()

  const processedHypotheses = useMemo(() => {
    let result = hypotheses.filter((h) => {
      const matchesStatus = h.status === status
      const matchesSearch = h.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesAssignee = filterAssignee === 'all' || h.assignee === filterAssignee

      return matchesStatus && matchesSearch && matchesAssignee
    })

    result.sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt - a.createdAt
      if (sortBy === 'oldest') return a.createdAt - b.createdAt
      if (sortBy === 'title-asc') return a.title.localeCompare(b.title)
      if (sortBy === 'title-desc') return b.title.localeCompare(a.title)
      return 0
    })

    return result
  }, [hypotheses, searchQuery, filterAssignee, sortBy, status])

  if (processedHypotheses.length === 0) {
    return <EmptyState message="Не найдено гипотез." />
  }

  return (
    <Table
      columns={columns}
      data={processedHypotheses}
      updateData={(rowId, columnId, value) => updateField(rowId, columnId as any, value)}
    />
  )
}

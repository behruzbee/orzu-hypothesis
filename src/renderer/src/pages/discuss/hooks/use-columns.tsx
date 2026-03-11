// @renderer/widgets/hypothesis-table/hooks/use-result-columns.tsx
import { Hypothesis } from '@renderer/shared/types/hypothesis'
import { EditableCell } from '@renderer/shared/ui/editable-cell'
import { TableTooltip } from '@renderer/shared/ui/table-tooltip'
import { createColumnHelper } from '@tanstack/react-table'
import { Target, Users, TrendingUp, TrendingDown, MessageSquare, User } from 'lucide-react'

const columnHelper = createColumnHelper<Hypothesis>()

export const useColumns = () => {
  return [
    columnHelper.accessor('title', {
      header: 'Гипотеза',
      size: 200,
      cell: ({ getValue, row, column, table }) => (
        <TableTooltip text={getValue()}>
          <EditableCell value={getValue()} rowId={row.original.id} columnId={column.id} updateData={(table.options.meta as any)?.updateData} />
        </TableTooltip>
      )
    }),

    columnHelper.display({
      id: 'metric_audience',
      header: 'Метрика',
      size: 160,
      cell: ({ row, table }) => (
        <div className="flex flex-col gap-1 py-1">
          <div className="flex items-center gap-2"><Target size={12} className="text-orzu shrink-0" /><EditableCell value={row.original.metricName} rowId={row.original.id} columnId="metricName" updateData={(table.options.meta as any)?.updateData} /></div>
          <div className="flex items-center gap-2 text-slate-400"><Users size={12} className="shrink-0" /><EditableCell value={row.original.targetAudience} rowId={row.original.id} columnId="targetAudience" updateData={(table.options.meta as any)?.updateData} /></div>
        </div>
      )
    }),

    columnHelper.display({
      id: 'plan_vs_fact',
      header: 'План / Факт',
      size: 180,
      cell: ({ row, table }) => {
        const a = Number(row.original.pointA) || 0
        const bPlan = Number(row.original.pointB) || 0
        const bFact = Number(row.original.actualPointB) || 0

        const planGrowth = a !== 0 ? (((bPlan - a) / a) * 100).toFixed(1) : '0.0'
        const factGrowth = a !== 0 ? (((bFact - a) / a) * 100).toFixed(1) : '0.0'
        
        const isGoalReached = bFact >= bPlan

        return (
          <div className="flex flex-col gap-1.5 py-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-bold uppercase tracking-wider">План:</span>
              <div className="flex items-center gap-2 font-mono">
                <span className="text-slate-400">{a} → {bPlan}</span>
                <span className="text-slate-400">(+{planGrowth}%)</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] p-1 rounded bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-bold uppercase tracking-wider">Факт:</span>
              <div className="flex items-center gap-2 font-mono font-bold">
                <EditableCell value={bFact} rowId={row.original.id} columnId="actualPointB" updateData={(r, c, v) => (table.options.meta as any)?.updateData(r, c, Number(v))} />
                <span className={isGoalReached ? 'text-green-600' : 'text-red-500'}>
                  {isGoalReached ? <TrendingUp size={12} className="inline mr-0.5" /> : <TrendingDown size={12} className="inline mr-0.5" />}
                  {factGrowth}%
                </span>
              </div>
            </div>
          </div>
        )
      }
    }),

    columnHelper.accessor('resultComment', {
      header: 'Выводы',
      size: 250,
      cell: ({ getValue, row, column, table }) => {
        const val = getValue()
        return (
          <div className="flex items-start gap-2">
            <MessageSquare size={14} className="text-slate-300 shrink-0 mt-0.5" />
            <TableTooltip text={val}>
              <EditableCell value={val} rowId={row.original.id} columnId={column.id} updateData={(table.options.meta as any)?.updateData} />
            </TableTooltip>
          </div>
        )
      }
    }),

    // 5. АВТОР
    columnHelper.accessor('assignee', {
      header: 'Автор',
      size: 130,
      cell: ({ getValue, row, column, table }) => (
        <div className="flex items-center gap-1.5">
          <User size={12} className="text-slate-300 shrink-0" />
          <EditableCell value={getValue()} rowId={row.original.id} columnId={column.id} updateData={(table.options.meta as any)?.updateData} />
        </div>
      )
    })
  ]
}
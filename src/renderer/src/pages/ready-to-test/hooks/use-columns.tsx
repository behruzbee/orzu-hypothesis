// @renderer/pages/ready-to-test/hooks/use-columns.tsx
import { Hypothesis } from '@renderer/shared/types/hypothesis'
import { EditableCell } from '@renderer/shared/ui/editable-cell'
import { TableTooltip } from '@renderer/shared/ui/table-tooltip'
import { createColumnHelper } from '@tanstack/react-table'
import { User, Target, TrendingUp, Play, Users } from 'lucide-react'
import { useAuthStore } from '@renderer/shared/store/use-auth-store' // 1. Импортируем Store

const columnHelper = createColumnHelper<Hypothesis>()

export const useColumns = (onLaunch: (id: string) => void) => {
  // 2. Достаем список имен пользователей
  const users = useAuthStore((state) => state.users)
  const userNames = users.map(u => u.username)

  return [
    columnHelper.accessor('title', {
      header: 'Гипотеза',
      size: 200,
      cell: ({ getValue, row, column, table }) => {
        const val = getValue()
        return (
          <TableTooltip text={val}>
            <EditableCell
              value={val}
              rowId={row.original.id}
              columnId={column.id}
              updateData={(table.options.meta as any)?.updateData}
            />
          </TableTooltip>
        )
      }
    }),

    columnHelper.display({
      id: 'metric_audience',
      header: 'Метрика и Аудитория',
      size: 220,
      cell: ({ row, table }) => (
        <div className="flex flex-col gap-1 leading-tight py-1">
          <div className="flex items-center gap-2 group/m">
            <Target size={12} className="text-orzu shrink-0" />
            <EditableCell
              value={row.original.metricName}
              rowId={row.original.id}
              columnId="metricName"
              updateData={(table.options.meta as any)?.updateData}
            />
          </div>
          <div className="flex items-center gap-2 text-slate-400 group/a">
            <Users size={12} className="shrink-0" />
            <EditableCell
              value={row.original.targetAudience}
              rowId={row.original.id}
              columnId="targetAudience"
              updateData={(table.options.meta as any)?.updateData}
            />
          </div>
        </div>
      )
    }),

    columnHelper.display({
      id: 'plan_growth',
      header: 'Цель и Рост',
      size: 160,
      cell: ({ row, table }) => {
        const a = Number(row.original.pointA) || 0
        const b = Number(row.original.pointB) || 0
        const growth = a !== 0 ? (((b - a) / a) * 100).toFixed(1) : '0.0'

        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-mono text-[13px]">
              <EditableCell
                value={a}
                rowId={row.original.id}
                columnId="pointA"
                updateData={(rId, cId, val) =>
                  (table.options.meta as any)?.updateData(rId, cId, Number(val))
                }
              />
              <span className="text-slate-300">→</span>
              <EditableCell
                value={b}
                rowId={row.original.id}
                columnId="pointB"
                updateData={(rId, cId, val) =>
                  (table.options.meta as any)?.updateData(rId, cId, Number(val))
                }
              />
            </div>
            <div className="flex items-center gap-1 text-green-600 font-black text-[11px]">
              <TrendingUp size={10} />
              <span>+{growth}%</span>
            </div>
          </div>
        )
      }
    }),

    // 4. Ответственный с ВЫБОРОМ (Select)
    columnHelper.accessor('assignee', {
      header: 'Ответственный',
      size: 130,
      cell: ({ getValue, row, column, table }) => (
        <div className="flex items-center gap-1.5 w-full">
          <User size={12} className="text-slate-300" />
          <EditableCell
            value={getValue()}
            rowId={row.original.id}
            columnId={column.id}
            updateData={(table.options.meta as any)?.updateData}
            type="select"      // 3. Указываем тип селекта
            options={userNames} // 4. Передаем список
          />
        </div>
      )
    }),

    columnHelper.display({
      id: 'actions',
      header: 'Старт',
      size: 110,
      cell: ({ row }) => (
        <button
          onClick={() => onLaunch(row.original.id)}
          className="w-full flex items-center justify-center gap-2 py-2 bg-orzu text-white hover:brightness-110 rounded-lg text-[11px] font-bold shadow-md shadow-orzu/10 transition-all cursor-pointer group uppercase tracking-wider"
        >
          <Play size={10} className="fill-current" />
          ПУСК
        </button>
      )
    })
  ]
}
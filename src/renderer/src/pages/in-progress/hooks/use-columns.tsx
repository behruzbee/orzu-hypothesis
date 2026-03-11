import { useEffect, useState } from 'react'
import { Hypothesis } from '@renderer/shared/types/hypothesis'
import { EditableCell } from '@renderer/shared/ui/editable-cell'
import { TableTooltip } from '@renderer/shared/ui/table-tooltip'
import { createColumnHelper } from '@tanstack/react-table'
import { Target, Users, TrendingUp } from 'lucide-react'

const columnHelper = createColumnHelper<Hypothesis>()

// --- КОМПОНЕНТ ТАЙМЕРА (БЕЗ ИЗМЕНЕНИЙ) ---
const ProgressTimer = ({ startedAt, value, unit }: any) => {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(interval)
  }, [])

  if (!startedAt || !value) return <span className="text-slate-300">Нет данных</span>

  const totalMs = unit === 'days' ? value * 86400000 : value * 3600000
  const endAt = startedAt + totalMs
  const leftMs = Math.max(0, endAt - now)
  const percent = Math.min(100, ((now - startedAt) / totalMs) * 100)

  const daysLeft = Math.floor(leftMs / 86400000)
  const hoursLeft = Math.floor((leftMs % 86400000) / 3600000)
  
  let timeLeftStr = ''
  if (daysLeft > 0) timeLeftStr = `${daysLeft} д. ${hoursLeft} ч.`
  else if (hoursLeft > 0) timeLeftStr = `${hoursLeft} ч.`
  else timeLeftStr = '< 1 часа'

  const isFinished = leftMs === 0

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between items-end text-[11px] font-bold">
        <span className={isFinished ? 'text-red-500 animate-pulse' : 'text-slate-500'}>
          {isFinished ? '⚠️ ВРЕМЯ ВЫШЛО' : `Осталось: ${timeLeftStr}`}
        </span>
        <span className={isFinished ? 'text-red-500' : 'text-orzu'}>{percent.toFixed(0)}%</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full transition-all duration-1000 ${isFinished ? 'bg-red-500' : 'bg-orzu'}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

// --- УМНАЯ ЯЧЕЙКА ДЕЙСТВИЙ ---
const ActionCell = ({ row, onFinish }: any) => {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(interval)
  }, [])

  const { startedAt, durationValue, durationUnit } = row.original
  if (!startedAt || !durationValue) return null

  const totalMs = durationUnit === 'days' ? durationValue * 86400000 : durationValue * 3600000
  const endAt = startedAt + totalMs
  const isFinished = now >= endAt // Проверяем, вышло ли время

  // Если время вышло - показываем КРАСНУЮ кнопку
  if (isFinished) {
    return (
      <button
        onClick={() => onFinish(row.original.id)}
        className="w-full py-2 bg-red-500 text-white rounded-lg text-[11px] font-black uppercase tracking-widest shadow-lg shadow-red-500/30 animate-pulse hover:bg-red-600 transition-all"
      >
        Завершить
      </button>
    )
  }

  // Если время еще есть - показываем бледную кнопку досрочного завершения
  return (
    <button
      onClick={() => onFinish(row.original.id)}
      className="w-full py-2 bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-lg text-[10px] font-bold uppercase transition-all"
      title="Завершить тест досрочно"
    >
      Остановить
    </button>
  )
}

export const useColumns = (onFinish: (id: string) => void) => {
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
      size: 180,
      cell: ({ row, table }) => (
        <div className="flex flex-col gap-1 py-1">
          <div className="flex items-center gap-2"><Target size={12} className="text-orzu shrink-0" /><EditableCell value={row.original.metricName} rowId={row.original.id} columnId="metricName" updateData={(table.options.meta as any)?.updateData} /></div>
          <div className="flex items-center gap-2 text-slate-400"><Users size={12} className="shrink-0" /><EditableCell value={row.original.targetAudience} rowId={row.original.id} columnId="targetAudience" updateData={(table.options.meta as any)?.updateData} /></div>
        </div>
      )
    }),

    columnHelper.display({
      id: 'plan_growth',
      header: 'Ожидания',
      size: 140,
      cell: ({ row, table }) => {
        const a = Number(row.original.pointA) || 0
        const b = Number(row.original.pointB) || 0
        const growth = a !== 0 ? (((b - a) / a) * 100).toFixed(1) : '0.0'
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-mono text-[13px]"><EditableCell value={a} rowId={row.original.id} columnId="pointA" updateData={(r, c, v) => (table.options.meta as any)?.updateData(r, c, Number(v))} /><span className="text-slate-300">→</span><EditableCell value={b} rowId={row.original.id} columnId="pointB" updateData={(r, c, v) => (table.options.meta as any)?.updateData(r, c, Number(v))} /></div>
            <div className="flex items-center gap-1 text-green-600 font-black text-[11px]"><TrendingUp size={10} /><span>+{growth}%</span></div>
          </div>
        )
      }
    }),

    columnHelper.display({
      id: 'progress',
      header: 'Прогресс',
      size: 160,
      cell: ({ row }) => <ProgressTimer startedAt={row.original.startedAt} value={row.original.durationValue} unit={row.original.durationUnit} />
    }),

    // ЗАМЕНИЛИ РЕНДЕР НА НАШУ УМНУЮ ЯЧЕЙКУ
    columnHelper.display({
      id: 'actions',
      header: 'Итог',
      size: 110,
      cell: ({ row }) => <ActionCell row={row} onFinish={onFinish} />
    })
  ]
}
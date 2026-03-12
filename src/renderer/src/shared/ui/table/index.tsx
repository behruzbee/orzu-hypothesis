// @renderer/shared/ui/table.tsx
import { useRef } from 'react'
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from '@tanstack/react-table'

interface TableProps<TData> {
  columns: ColumnDef<TData, any>[]
  data: TData[]
  updateData?: (rowId: string, columnId: string, value: any) => void
  onRowClick?: (row: TData) => void
}

export function Table<TData>({ columns, data, updateData, onRowClick }: TableProps<TData>) {
  // 1. Создаем ссылку для таймера
  const clickTimeout = useRef<NodeJS.Timeout | null>(null)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: { updateData }
  })

  return (
    <div className="overflow-visible w-full border border-slate-200 rounded-xl bg-white shadow-sm">
      <table className="w-full text-left border-collapse table-fixed">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-slate-200 bg-slate-50/50">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest"
                  style={{ width: `${header.getSize()}px` }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              onClick={(e) => {
                // Игнорируем клики по уже открытым инпутам и кнопкам
                const target = e.target as HTMLElement
                if (['INPUT', 'SELECT', 'BUTTON', 'TEXTAREA'].includes(target.tagName) || target.closest('button')) {
                  return
                }

                // УМНАЯ ЛОГИКА КЛИКОВ:
                // e.detail хранит количество быстрых кликов подряд
                
                if (e.detail === 2) {
                  // Это ДВОЙНОЙ КЛИК. Отменяем открытие модалки!
                  if (clickTimeout.current) clearTimeout(clickTimeout.current)
                  return
                }

                if (e.detail === 1) {
                  // Это ОДИНАРНЫЙ КЛИК. Ждем 200мс, вдруг пользователь кликнет второй раз.
                  clickTimeout.current = setTimeout(() => {
                    onRowClick?.(row.original)
                  }, 200)
                }
              }}
              className={`border-b border-slate-100 last:border-none transition-colors ${onRowClick ? 'cursor-pointer hover:bg-slate-50' : 'hover:bg-slate-50/30'}`}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="p-3 text-sm align-middle relative overflow-visible"
                  style={{ width: `${cell.column.getSize()}px` }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
// @renderer/shared/ui/table.tsx
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from '@tanstack/react-table'

interface TableProps<TData> {
  columns: ColumnDef<TData, any>[]
  data: TData[]
  updateData?: (rowId: string, columnId: string, value: any) => void
}

export function Table<TData>({ columns, data, updateData }: TableProps<TData>) {
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
              className="border-b border-slate-100 last:border-none hover:bg-slate-50/30 transition-colors"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  // ВАЖНО: td должен быть overflow-visible
                  className="p-3 text-sm align-middle relative overflow-visible"
                  style={{ width: `${cell.column.getSize()}px` }}
                >
                  {/* МЫ УБРАЛИ <div className="truncate"> ОТСЮДА */}
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

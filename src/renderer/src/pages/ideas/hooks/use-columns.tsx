import { Hypothesis } from '@renderer/shared/types/hypothesis'
import { EditableCell } from '@renderer/shared/ui/editable-cell'
import { TableTooltip } from '@renderer/shared/ui/table-tooltip'
import { createColumnHelper } from '@tanstack/react-table'
import { User, Calendar, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@renderer/shared/store/use-auth-store' // Импортируем store

const columnHelper = createColumnHelper<Hypothesis>()

export const useColumns = (onAccept: (id: string) => void) => {
  // Получаем список пользователей из базы для выпадающего списка
  const users = useAuthStore((state) => state.users)
  const userNames = users.map(u => u.username)

  const columns = [
    columnHelper.accessor('title', {
      header: 'Название',
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

    columnHelper.accessor('description', {
      header: 'Описание',
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

    columnHelper.accessor('assignee', {
      header: 'Ответственный',
      size: 150,
      cell: ({ getValue, row, column, table }) => {
        const val = getValue()
        return (
          <div className="flex items-center gap-2 overflow-visible w-full">
            <User size={14} className="text-slate-300 shrink-0" />
            <TableTooltip text={val}>
              <EditableCell
                value={val}
                rowId={row.original.id}
                columnId={column.id}
                updateData={(table.options.meta as any)?.updateData}
                type="select"      // Указываем тип select
                options={userNames} // Передаем список имен
              />
            </TableTooltip>
          </div>
        )
      }
    }),

    columnHelper.accessor('createdAt', {
      header: 'Дата создания',
      cell: (info) => (
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Calendar size={14} className="text-slate-400" />
          {new Date(info.getValue()).toLocaleDateString('ru-RU')}
        </div>
      )
    }),

    columnHelper.display({
      id: 'actions',
      header: 'Действия',
      cell: (info) => (
        <button
          onClick={() => onAccept(info.row.original.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-orzu hover:bg-green-100 rounded-lg text-sm font-bold transition-colors cursor-pointer"
        >
          <CheckCircle size={16} />
          Принять
        </button>
      )
    })
  ]

  return columns
}
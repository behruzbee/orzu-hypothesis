import { useState, useEffect, KeyboardEvent } from 'react'

interface EditableCellProps {
  value: any
  rowId: string
  columnId: string
  updateData: (rowId: string, columnId: string, value: any) => void
  type?: 'text' | 'select' // Добавляем тип
  options?: string[]       // Список имен пользователей
}

export const EditableCell = ({
  value: initialValue,
  rowId,
  columnId,
  updateData,
  type = 'text',
  options = []
}: EditableCellProps) => {
  const [value, setValue] = useState(initialValue)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const onBlur = () => {
    setIsEditing(false)
    if (value !== initialValue) {
      updateData(rowId, columnId, value)
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.key === 'Enter') onBlur()
    if (e.key === 'Escape') {
      setValue(initialValue)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    if (type === 'select') {
      return (
        <select
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={onBlur}
          className="w-full h-[24px] px-1 text-sm border border-orzu rounded outline-none bg-white shadow-[0_0_5px_rgba(35,140,0,0.2)] cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )
    }

    return (
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown as any}
        className="w-full h-[24px] px-1 py-0 text-sm border border-orzu rounded outline-none bg-white shadow-[0_0_5px_rgba(35,140,0,0.2)]"
      />
    )
  }

  return (
    <div
      onDoubleClick={(e) => {
        e.stopPropagation()
        setIsEditing(true)
      }}
      className="cursor-pointer hover:text-orzu transition-colors truncate w-full min-h-[24px] flex items-center"
    >
      {value || <span className="text-slate-300 italic text-[12px]">Добавить...</span>}
    </div>
  )
}
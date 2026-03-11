import React from 'react'

interface Props {
  text: string | undefined
  children: React.ReactNode
}

export const TableTooltip = ({ text, children }: Props) => {
  return (
    <div className="relative group w-full overflow-visible">
      <div className="truncate w-full">
        {children}
      </div>

      {text && (
        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-[100] w-80 p-3 bg-slate-800 text-white text-[12px] rounded-xl shadow-2xl whitespace-normal break-words leading-relaxed border border-slate-700 pointer-events-none transition-opacity">
          {text}
          <div className="absolute left-4 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-800"></div>
        </div>
      )}
    </div>
  )
}
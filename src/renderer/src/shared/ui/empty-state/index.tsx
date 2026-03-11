interface Props {
  message?: string;
}

export const EmptyState = ({ message = 'Нет данных для отображения.' }: Props) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-500 min-h-[100%]">
      <p>{message}</p>
    </div>
  )
}
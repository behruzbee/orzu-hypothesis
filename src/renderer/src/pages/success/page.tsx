import { HypothesisStatus } from '@renderer/shared/types/hypothesis'
import { HypothesisTable } from '@renderer/widgets/hypothesis-table/ui/hypothesis-table'
import { HypothesisToolbar } from '@renderer/widgets/hypothesis-toolbar'
import { useColumns } from './hooks/use-columns'

export const SuccessPage = () => {
  const columns = useColumns()

  return (
    <div className="flex flex-col gap-6 h-full relative">
      <HypothesisToolbar />
      <div className="flex-1 bg-white rounded-xl border border-slate-200 p-6 flex flex-col overflow-hidden shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-green-600 flex items-center gap-2">
            🏆 Успешные гипотезы
          </h2>
          <p className="text-sm text-slate-500">Наши победы. Фичи, которые пошли в релиз и принесли рост.</p>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 pb-10">
          <HypothesisTable columns={columns} status={HypothesisStatus.SUCCESS} />
        </div>
      </div>
    </div>
  )
}
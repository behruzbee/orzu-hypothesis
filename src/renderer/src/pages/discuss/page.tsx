import { HypothesisStatus } from '@renderer/shared/types/hypothesis'
import { HypothesisTable } from '@renderer/widgets/hypothesis-table/ui/hypothesis-table'
import { HypothesisToolbar } from '@renderer/widgets/hypothesis-toolbar'
import { useColumns } from './hooks/use-columns'

export const DiscussPage = () => {
  const columns = useColumns()

  return (
    <div className="flex flex-col gap-6 h-full relative">
      <HypothesisToolbar />
      <div className="flex-1 bg-white rounded-xl border border-slate-200 p-6 flex flex-col overflow-hidden shadow-sm">
        <div className="mb-6">
          <p className="text-sm text-slate-500">Спорные результаты. Требуется решение команды на синке.</p>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 pb-10">
          <HypothesisTable columns={columns} status={HypothesisStatus.DISCUSS} />
        </div>
      </div>
    </div>
  )
}
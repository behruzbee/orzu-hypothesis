import { useState } from 'react'
import { HypothesisTable } from '@renderer/widgets/hypothesis-table/ui/hypothesis-table'
import { HypothesisStatus } from '@renderer/shared/types/hypothesis'
import { HypothesisToolbar } from '@renderer/widgets/hypothesis-toolbar'
import { FinishTestModal } from '@renderer/features/hypothesis/ui/finish-test-modal'
import { useColumns } from './hooks/use-columns'

export const InProgressPage = () => {
  const [finishId, setFinishId] = useState<string | null>(null)
  
  const columns = useColumns((id) => setFinishId(id))

  return (
    <div className="flex flex-col gap-6 h-full relative">
      <HypothesisToolbar />

      <div className="flex-1 bg-white rounded-xl border border-slate-200 p-6 flex flex-col overflow-hidden shadow-sm">
        <div className="mb-6">
          <p className="text-sm text-slate-500">
            Здесь отображаются запущенные эксперименты. Следите за таймерами!
          </p>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-10">
          <HypothesisTable columns={columns} status={HypothesisStatus.PROGRESS} />
        </div>
      </div>

      {/* Модалка завершения теста */}
      <FinishTestModal 
        hypothesisId={finishId} 
        onClose={() => setFinishId(null)} 
      />
    </div>
  )
}
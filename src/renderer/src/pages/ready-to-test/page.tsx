// src/renderer/src/pages/ready-to-test/ui/ready-to-test-page.tsx
import { useState } from 'react'
import { HypothesisTable } from '@renderer/widgets/hypothesis-table/ui/hypothesis-table'
import { HypothesisStatus } from '@renderer/shared/types/hypothesis'
import { HypothesisToolbar } from '@renderer/widgets/hypothesis-toolbar'
import { StartTestModal } from '@renderer/features/hypothesis/ui/start-test-modal'
import { useColumns } from './hooks/use-columns'

export const ReadyToTestPage = () => {
  const [launchId, setLaunchId] = useState<string | null>(null)
  
  const columns = useColumns((id) => setLaunchId(id))

  return (
    <div className="flex flex-col gap-6 h-full relative">
      <HypothesisToolbar />

      <div className="flex-1 bg-white rounded-xl border border-slate-200 p-6 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto pr-2 pb-10">
          <HypothesisTable columns={columns} status={HypothesisStatus.READY} />
        </div>
      </div>

      <StartTestModal 
        hypothesisId={launchId} 
        onClose={() => setLaunchId(null)} 
      />
    </div>
  )
}
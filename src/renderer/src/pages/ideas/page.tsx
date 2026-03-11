// @renderer/pages/ideas/ui/ideas-page.tsx
import { useState } from 'react'
import { HypothesisTable } from '@renderer/widgets/hypothesis-table/ui/hypothesis-table'
import { HypothesisToolbar } from '@renderer/widgets/hypothesis-toolbar/ui/hypothesis-toolbar'
import { CreateHypothesisModal, AcceptHypothesisModal } from '@renderer/features/hypothesis'
import { HypothesisStatus } from '@renderer/shared/types/hypothesis'
import { useColumns } from './hooks/use-columns'

export const IdeasPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [acceptHypothesisId, setAcceptHypothesisId] = useState<string | null>(null)

  const columns = useColumns((id: string) => setAcceptHypothesisId(id))

  return (
    <div className="flex flex-col gap-6 h-full relative">
      <HypothesisToolbar onCreateClick={() => setIsCreateModalOpen(true)} />

      <div className="flex-1 bg-white rounded-xl border border-slate-200 p-6 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto pr-2 pb-10">
          <HypothesisTable columns={columns} status={HypothesisStatus.IDEAS} />
        </div>
      </div>

      <CreateHypothesisModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <AcceptHypothesisModal
        hypothesisId={acceptHypothesisId}
        onClose={() => setAcceptHypothesisId(null)}
      />
    </div>
  )
}

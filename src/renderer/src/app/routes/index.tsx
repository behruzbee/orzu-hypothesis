import { HashRouter, Route, Routes as ReactRoutes } from 'react-router-dom'
import { Sidebar } from '@renderer/widgets/sidebar'
import { IdeasPage } from '@renderer/pages/ideas'
import { ReadyToTestPage } from '@renderer/pages/ready-to-test'
import { InProgressPage } from '@renderer/pages/in-progress'
import { SuccessPage } from '@renderer/pages/success'
import { FailedPage } from '@renderer/pages/failed'
import { DiscussPage } from '@renderer/pages/discuss'
import { StatsPage } from '@renderer/pages/stats/page'

import { useAuthStore } from '@renderer/shared/store/use-auth-store'
import { AuthPage } from '@renderer/pages/auth'
import { AdminPage } from '@renderer/pages/admin'
import { useHypothesisStore } from '@renderer/shared/store/use-hypothesis-store'
import { useEffect } from 'react'

export const Routing = () => {
  const fetchHypotheses = useHypothesisStore((state) => state.fetchHypotheses)
  const { isAuthenticated, role } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      fetchHypotheses()
      useAuthStore.getState().fetchUsers() 
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return <AuthPage />
  }

  return (
    <HashRouter>
      <div className="flex w-full h-screen font-sans bg-slate-50 m-0 overflow-hidden">
        <Sidebar />

        <main className="flex-1 p-10 overflow-y-auto">
          <ReactRoutes>
            <Route path="/" element={<IdeasPage />} />
            <Route path="/ready" element={<ReadyToTestPage />} />
            <Route path="/progress" element={<InProgressPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/failed" element={<FailedPage />} />
            <Route path="/discuss" element={<DiscussPage />} />
            <Route path="/stats" element={<StatsPage />} />

            {role === 'admin' && <Route path="/admin" element={<AdminPage />} />}
          </ReactRoutes>
        </main>
      </div>
    </HashRouter>
  )
}

import { ipcMain } from 'electron'
import { db } from '../database/connect'
import { hypothesesTable, progressHistoryTable } from '../database/schema'
import { getSession } from '../session'
import { eq } from 'drizzle-orm'

export function registerHypothesisHandlers() {
  // ЧТЕНИЕ
  ipcMain.handle('db:read', async () => {
    const currentUser = getSession()
    if (!currentUser) return []
    
    try {
      let baseQuery = db.select().from(hypothesesTable)
      if (currentUser.role !== 'admin') {
        baseQuery = baseQuery.where(eq(hypothesesTable.authorId, currentUser.id)) as any
      }
      
      const hypotheses = await baseQuery

      const allHistory = await db.select().from(progressHistoryTable)
      
      const result = hypotheses.map(hyp => ({
        ...hyp,
        progressHistory: allHistory.filter(h => h.hypothesisId === hyp.id)
      }))

      return result
    } catch (error) {
      console.error('Ошибка чтения из БД:', error)
      return []
    }
  })

  ipcMain.handle('db:createHypothesis', async (_, hypothesesArray: any[]) => {
    const currentUser = getSession()
    if (!currentUser) return { success: false, error: 'Не авторизован' }

    try {
      const docs = hypothesesArray.map(h => ({
        id: h.id, 
        title: h.title,
        status: h.status,
        createdAt: h.createdAt,
        authorId: currentUser.id
      }))
      
      await db.insert(hypothesesTable).values(docs)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:updateHypothesis', async (_, { id, updates }) => {
    const currentUser = getSession()
    if (!currentUser) return { success: false, error: 'Не авторизован' }

    try {
      if (currentUser.role !== 'admin') {
        const hyp = await db.select().from(hypothesesTable).where(eq(hypothesesTable.id, id)).limit(1)
        if (!hyp[0] || hyp[0].authorId !== currentUser.id) {
          return { success: false, error: 'Нет прав доступа' }
        }
      }

      const { progressHistory, ...mainFields } = updates

      if (Object.keys(mainFields).length > 0) {
        await db.update(hypothesesTable)
          .set(mainFields)
          .where(eq(hypothesesTable.id, id))
      }

      if (progressHistory) {
        await db.delete(progressHistoryTable).where(eq(progressHistoryTable.hypothesisId, id))
        
        if (progressHistory.length > 0) {
          const newRecords = progressHistory.map((record: any) => ({
            id: record.id,
            date: record.date,
            value: record.value,
            hypothesisId: id
          }))
          await db.insert(progressHistoryTable).values(newRecords)
        }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
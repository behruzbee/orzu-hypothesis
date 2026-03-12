import { ipcMain } from 'electron'
import { HypothesisModel } from '../database/models/Hypothesis'
import { getSession } from '../session'

export function registerHypothesisHandlers() {
  ipcMain.handle('db:read', async () => {
    const currentUser = getSession()
    if (!currentUser) return []
    
    try {
      let data
      if (currentUser.role === 'admin') {
        data = await HypothesisModel.find({})
      } else {
        data = await HypothesisModel.find({ authorId: currentUser._id })
      }

      return data.map(doc => {
        const obj = doc.toObject() as any
        delete obj._id
        delete obj.__v
        return obj
      })
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
        ...h,
        authorId: currentUser._id
      }))
      await HypothesisModel.insertMany(docs)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('db:updateHypothesis', async (_, { id, updates }) => {
    const currentUser = getSession()
    if (!currentUser) return { success: false, error: 'Не авторизован' }

    try {
      const filter: any = { id }
      if (currentUser.role !== 'admin') {
        filter.authorId = currentUser._id
      }

      const result = await HypothesisModel.updateOne(filter, { $set: updates })
      if (result.modifiedCount === 0 && result.matchedCount === 0) {
        return { success: false, error: 'Гипотеза не найдена или нет прав доступа' }
      }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
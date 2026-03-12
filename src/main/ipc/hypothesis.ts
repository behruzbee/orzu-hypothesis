import { ipcMain } from 'electron'
import { prisma } from '../database/connect'
import { getSession } from '../session'

export function registerHypothesisHandlers() {
  // ЧТЕНИЕ
  ipcMain.handle('db:read', async () => {
    const currentUser = getSession()
    if (!currentUser) return []
    
    try {
      const hypotheses = await prisma.hypothesis.findMany({
        where: currentUser.role === 'admin' ? undefined : { authorId: currentUser.id },
        include: { progressHistory: true } // ВАЖНО: Подтягиваем связанную таблицу замеров!
      })
      return hypotheses
    } catch (error) {
      console.error('Ошибка чтения из БД:', error)
      return []
    }
  })

  // СОЗДАНИЕ
  ipcMain.handle('db:createHypothesis', async (_, hypothesesArray: any[]) => {
    const currentUser = getSession()
    if (!currentUser) return { success: false, error: 'Не авторизован' }

    try {
      // Prisma createMany для вставки массива
      const docs = hypothesesArray.map(h => ({
        id: h.id, // сохраняем UUID с фронта
        title: h.title,
        status: h.status,
        createdAt: h.createdAt,
        authorId: currentUser.id
      }))
      
      await prisma.hypothesis.createMany({ data: docs })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  // ОБНОВЛЕНИЕ (И ячеек таблицы, и истории замеров)
  ipcMain.handle('db:updateHypothesis', async (_, { id, updates }) => {
    const currentUser = getSession()
    if (!currentUser) return { success: false, error: 'Не авторизован' }

    try {
      // Проверка прав (Юзер не может менять чужое)
      if (currentUser.role !== 'admin') {
        const hyp = await prisma.hypothesis.findUnique({ where: { id } })
        if (!hyp || hyp.authorId !== currentUser.id) {
          return { success: false, error: 'Нет прав доступа' }
        }
      }

      // Отделяем историю замеров от обычных полей, так как в SQL это другая таблица
      const { progressHistory, ...mainFields } = updates

      // 1. Обновляем основные поля гипотезы
      if (Object.keys(mainFields).length > 0) {
        await prisma.hypothesis.update({
          where: { id },
          data: mainFields
        })
      }

      // 2. Умное обновление истории (если она пришла с фронта)
      if (progressHistory) {
        // Проще всего удалить старую историю и записать новую, так как фронтенд всегда присылает полный массив
        await prisma.progressRecord.deleteMany({ where: { hypothesisId: id } })
        
        if (progressHistory.length > 0) {
          await prisma.progressRecord.createMany({
            data: progressHistory.map((record: any) => ({
              id: record.id,
              date: record.date,
              value: record.value,
              hypothesisId: id // Привязываем к гипотезе
            }))
          })
        }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
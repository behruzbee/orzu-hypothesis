import { ipcMain } from 'electron'
import bcrypt from 'bcryptjs'
import { prisma } from '../database/connect'
import { getSession } from '../session'

export function registerAdminHandlers() {
  ipcMain.handle('admin:createUser', async (_, { username, password, role }) => {
    const currentUser = getSession()
    if (!currentUser || currentUser.role !== 'admin') return { success: false, error: 'Нет прав' }
    
    try {
      const existing = await prisma.user.findUnique({ where: { username } })
      if (existing) return { success: false, error: 'Имя уже занято' }

      const hashedPassword = await bcrypt.hash(password, 10)
      await prisma.user.create({
        data: { username, password: hashedPassword, role: role || 'user' }
      })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('admin:getUsers', async () => {
    try {
      const users = await prisma.user.findMany({
        select: { id: true, username: true, role: true } // select заменяет '-password' из mongoose
      })
      return { success: true, users }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
import { ipcMain } from 'electron'
import bcrypt from 'bcryptjs'
import { db } from '../database/connect'
import { usersTable } from '../database/schema'
import { eq } from 'drizzle-orm'
import { setSession, clearSession } from '../session'

export function registerAuthHandlers() {
  ipcMain.handle('auth:login', async (_, { username, password }) => {
    try {
      // Ищем пользователя через Drizzle
      const result = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.username, username))
        .limit(1)
        
      const user = result[0]

      if (!user) return { success: false, error: 'Пользователь не найден' }

      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) return { success: false, error: 'Неверный пароль' }

      setSession(user)
      return { success: true, username: user.username, id: user.id, role: user.role }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('auth:logout', () => {
    clearSession()
    return true
  })
}
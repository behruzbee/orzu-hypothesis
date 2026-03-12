import { ipcMain } from 'electron'
import bcrypt from 'bcryptjs'
import { db } from '../database/connect'
import { usersTable } from '../database/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '../session'

export function registerAdminHandlers() {
  ipcMain.handle('admin:createUser', async (_, { username, password, role }) => {
    const currentUser = getSession()
    if (!currentUser || currentUser.role !== 'admin') return { success: false, error: 'Нет прав' }
    
    try {
      // 1. Проверяем, существует ли пользователь (Drizzle)
      const existing = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.username, username))
        .limit(1)
        
      if (existing.length > 0) return { success: false, error: 'Имя уже занято' }

      // 2. Хешируем и создаем (Drizzle)
      const hashedPassword = await bcrypt.hash(password, 10)
      
      await db.insert(usersTable).values({ 
        username, 
        password: hashedPassword, 
        role: role || 'user' 
      })
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('admin:getUsers', async () => {
    try {
      // 3. Получаем всех пользователей, но БЕЗ паролей (Drizzle)
      // Передаем в select() только те поля, которые хотим вытащить
      const users = await db
        .select({
          id: usersTable.id,
          username: usersTable.username,
          role: usersTable.role
        })
        .from(usersTable)
        
      return { success: true, users }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
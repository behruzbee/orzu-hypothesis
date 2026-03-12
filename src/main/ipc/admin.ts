import { ipcMain } from 'electron'
import bcrypt from 'bcryptjs'
import { User } from '../database/models/User'
import { getSession } from '../session'

export function registerAdminHandlers() {
  ipcMain.handle('admin:createUser', async (_, { username, password, role }) => {
    const currentUser = getSession()
    if (!currentUser || currentUser.role !== 'admin') return { success: false, error: 'Нет прав' }
    
    try {
      const existing = await User.findOne({ username })
      if (existing) return { success: false, error: 'Имя уже занято' }

      const hashedPassword = await bcrypt.hash(password, 10)
      await User.create({ username, password: hashedPassword, role: role || 'user' })
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('admin:getUsers', async () => {
    try {
      const users = await User.find({}).select('-password')
      const formattedUsers = users.map(u => ({
        id: u._id.toString(),
        username: u.username,
        role: u.role
      }))
      return { success: true, users: formattedUsers }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })
}
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// Импортируем нашу базу данных и bcrypt для работы с паролями
import bcrypt from 'bcryptjs'
import { connectDB, User, HypothesisModel } from './db'

// Глобальная переменная для хранения текущей сессии пользователя
let currentUser: any = null

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1300,
    height: 725,
    title: 'Orzu Hypothesis',
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // 🚀 Подключаемся к MongoDB перед созданием окна
  await connectDB()

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// =====================================================================
// БЭКЕНД: АВТОРИЗАЦИЯ И РАБОТА С БАЗОЙ ДАННЫХ MONGODB
// =====================================================================

ipcMain.handle('auth:login', async (_, { username, password }) => {
  try {
    const user = await User.findOne({ username }) as any
    if (!user) return { success: false, error: 'Пользователь не найден' }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return { success: false, error: 'Неверный пароль' }

    currentUser = user
    // Возвращаем роль вместе с логином
    return { success: true, username: user.username, id: user._id.toString(), role: user.role }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
})

// Создание пользователя (ТЕПЕРЬ ДОСТУПНО ТОЛЬКО АДМИНУ)
ipcMain.handle('admin:createUser', async (_, { username, password, role }) => {
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

ipcMain.handle('auth:logout', () => {
  currentUser = null
  return true
})

// Чтение гипотез (УМНОЕ РАЗДЕЛЕНИЕ)
ipcMain.handle('db:read', async () => {
  if (!currentUser) return []
  
  try {
    let data;
    if (currentUser.role === 'admin') {
      // Админ получает ВСЕ гипотезы
      data = await HypothesisModel.find({})
    } else {
      // Обычный юзер получает ТОЛЬКО СВОИ
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

// Синхронизация (УМНОЕ СОХРАНЕНИЕ)
// ipcMain.handle('db:sync', async (_, hypotheses: any[]) => {
//   if (!currentUser) return false

//   try {
//     // Подготавливаем операции для массового обновления (чтобы не затереть чужие данные)
//     const operations = hypotheses.map(h => ({
//       updateOne: {
//         filter: { id: h.id },
//         update: { $set: { ...h, authorId: h.authorId || currentUser._id } },
//         upsert: true // Если нет - создаст, если есть - обновит
//       }
//     }))

//     if (operations.length > 0) {
//       await HypothesisModel.bulkWrite(operations)
//     }

//     // Удаляем те гипотезы, которые были удалены в интерфейсе
//     const currentIds = hypotheses.map(h => h.id)
//     if (currentUser.role === 'admin') {
//       await HypothesisModel.deleteMany({ id: { $nin: currentIds } })
//     } else {
//       await HypothesisModel.deleteMany({ authorId: currentUser._id, id: { $nin: currentIds } })
//     }
    
//     return true
//   } catch (error) {
//     console.error('Ошибка синхронизации с БД:', error)
//     return false
//   }
// })
ipcMain.handle('admin:getUsers', async () => {
  if (!currentUser || currentUser.role !== 'admin') {
    return { success: false, error: 'Нет прав' }
  }
  
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

// 1. Создание новых гипотез
ipcMain.handle('db:createHypothesis', async (_, hypothesesArray: any[]) => {
  if (!currentUser) return { success: false, error: 'Не авторизован' }

  try {
    const docs = hypothesesArray.map(h => ({
      ...h,
      authorId: currentUser._id // Жестко привязываем к автору
    }))
    
    await HypothesisModel.insertMany(docs)
    return { success: true }
  } catch (error: any) {
    console.error('Ошибка создания гипотезы:', error)
    return { success: false, error: error.message }
  }
})

// 2. Точечное обновление одной гипотезы
ipcMain.handle('db:updateHypothesis', async (_, { id, updates }) => {
  if (!currentUser) return { success: false, error: 'Не авторизован' }

  try {
    // Формируем фильтр: Админ может менять любую гипотезу, юзер - только свою
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
    console.error('Ошибка обновления гипотезы:', error)
    return { success: false, error: error.message }
  }
})
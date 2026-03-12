import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'

import { connectDB } from './database/connect'
import { createWindow } from './window'
import { registerAuthHandlers } from './ipc/auth'
import { registerAdminHandlers } from './ipc/admin'
import { registerHypothesisHandlers } from './ipc/hypothesis'

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  await connectDB()

  registerAuthHandlers()
  registerAdminHandlers()
  registerHypothesisHandlers()

  createWindow()

  autoUpdater.checkForUpdatesAndNotify()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
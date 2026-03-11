import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  // Auth
  login: (data) => ipcRenderer.invoke('auth:login', data),
  register: (data) => ipcRenderer.invoke('auth:register', data),
  logout: () => ipcRenderer.invoke('auth:logout'),
  
  // Database
  readHypotheses: () => ipcRenderer.invoke('db:read'),
  syncHypotheses: (data) => ipcRenderer.invoke('db:sync', data),
  createHypothesis: (data) => ipcRenderer.invoke('db:createHypothesis', data), // <--- НОВОЕ
  updateHypothesis: (data) => ipcRenderer.invoke('db:updateHypothesis', data), // <--- НОВОЕ

  // Admin
  createUser: (data) => ipcRenderer.invoke('admin:createUser', data),
  getUsers: () => ipcRenderer.invoke('admin:getUsers')
})
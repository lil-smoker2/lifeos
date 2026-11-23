const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  quit: () => ipcRenderer.invoke('app-quit'),
  getVersion: () => ipcRenderer.invoke('get-version'),
})

const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const fs = require('fs')

let mainWindow = null
let apiProcess = null

function getApiDir() {
  if (process.resourcesPath) {
    // Packaged: API bundled at <resources>/api
    const bundledApi = path.join(process.resourcesPath, 'api')
    if (fs.existsSync(bundledApi)) return bundledApi
  }
  // Dev: API at repo/apps/api
  return path.resolve(__dirname, '..', '..', 'apps', 'api')
}

function getPythonCmd(apiDir) {
  const venvPython = path.join(apiDir, '.venv', 'bin', 'python')
  if (fs.existsSync(venvPython)) return venvPython
  return 'python3'
}

function startApi() {
  const apiDir = getApiDir()
  const pythonCmd = getPythonCmd(apiDir)

  apiProcess = spawn(pythonCmd, ['-m', 'uvicorn', 'app.main:app', '--port', '8000'], {
    cwd: apiDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PYTHONUNBUFFERED: '1' },
  })

  apiProcess.stdout.on('data', () => { /* API logs */ })
  apiProcess.stderr.on('data', () => { /* API logs */ })

  apiProcess.on('exit', () => {
    apiProcess = null
  })
}

function stopApi() {
  if (apiProcess) {
    apiProcess.kill('SIGTERM')
    apiProcess = null
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    title: 'LifeOS',
    icon: path.join(__dirname, '..', 'public', 'icon-512x512.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // In production, load the built app; in dev, load the dev server
  const isDev = process.env.NODE_ENV === 'development'

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173/')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  startApi()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  stopApi()
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  stopApi()
})

ipcMain.handle('app-quit', () => {
  stopApi()
  app.quit()
})

ipcMain.handle('get-version', () => {
  return app.getVersion()
})

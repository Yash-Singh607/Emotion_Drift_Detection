const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const http = require('http');

let mainWindow = null;
let splashWindow = null;
let backendProcess = null;

// Determine if we are running in development mode
const isDev = !app.isPackaged && process.argv.includes('--dev');

// 1. Spawning FastAPI Backend
function startBackend() {
  let pythonPath;
  let workingDir;

  if (isDev) {
    // Development environment
    pythonPath = path.join(__dirname, 'env', 'Scripts', 'python.exe');
    workingDir = __dirname;
  } else {
    // Packaged Electron app environment
    pythonPath = path.join(process.resourcesPath, 'env', 'Scripts', 'python.exe');
    workingDir = process.resourcesPath;
  }

  console.log(`Starting FastAPI Backend via: ${pythonPath}`);
  console.log(`Working Directory: ${workingDir}`);

  // Spawn python relatively and call uvicorn as a module to avoid shebang path bugs
  backendProcess = spawn(pythonPath, ['-m', 'uvicorn', 'app:app', '--host', '127.0.0.1', '--port', '8000'], {
    cwd: workingDir,
    env: { ...process.env }
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`[FastAPI Stdout]: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`[FastAPI Stderr]: ${data}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`FastAPI Backend process exited with code ${code}`);
  });
}

// 2. Process Cleanup
function killBackendProcess() {
  if (backendProcess) {
    console.log(`Terminating FastAPI process tree (PID: ${backendProcess.pid})...`);
    
    // Windows-specific process tree taskkill
    exec(`taskkill /pid ${backendProcess.pid} /t /f`, (err) => {
      if (err) {
        console.error('Failed taskkill, running childProcess.kill():', err);
        backendProcess.kill();
      }
      backendProcess = null;
    });
  }
}

// 3. Create Windows
function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 480,
    height: 280,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  splashWindow.loadFile('splash.html');
  splashWindow.on('closed', () => {
    splashWindow = null;
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 850,
    show: false, // Shown once ready
    backgroundColor: '#080c14',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 4. Ping Backend Polling Loop
function checkBackendOnline() {
  const req = http.request({
    host: '127.0.0.1',
    port: 8000,
    path: '/timeline',
    method: 'GET',
    timeout: 1000
  }, (res) => {
    // Backend is ready! Close splash and open main window
    createMainWindow();
    if (splashWindow) {
      splashWindow.close();
      splashWindow = null;
    }
  });

  req.on('error', () => {
    // Retry in 500ms
    setTimeout(checkBackendOnline, 500);
  });

  req.end();
}

// 5. Electron Application Lifecycle
app.whenReady().then(() => {
  createSplashWindow();
  startBackend();
  checkBackendOnline();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createSplashWindow();
      checkBackendOnline();
    }
  });
});

app.on('window-all-closed', () => {
  killBackendProcess();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  killBackendProcess();
});

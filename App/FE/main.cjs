const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1024,
    // minHeight: 700,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL('http://localhost:5173/auth/sign-in');

 mainWindow.webContents.on('did-finish-load', () => {
  mainWindow.webContents.executeJavaScript(`
    (function() {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.role_name !== 'cashier') { 
          alert('Akses Ditolak: Aplikasi desktop hanya untuk Kasir.');
          
          localStorage.clear(); 
          sessionStorage.clear();
          
          window.location.href = '/auth/sign-in';
        }
      }
    })();
  `);
});
}

ipcMain.on('window-controls', (event, action) => {
  switch (action) {
    case 'close': app.quit(); break;
    case 'minimize': mainWindow.minimize(); break;
    case 'maximize': 
      mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize(); 
      break;
  }
});

app.whenReady().then(createWindow);
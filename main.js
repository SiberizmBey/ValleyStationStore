const { app, BrowserWindow } = require('electron');

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 600,
        frame: false,        // Windows çerçevesini kaldırır
        transparent: true,  // Köşelerin yuvarlak görünmesini sağlar
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false, // Bunu mutlaka false yap
            allowRunningInsecureContent: true // Güvensiz içeriğe izin ver
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(createWindow);
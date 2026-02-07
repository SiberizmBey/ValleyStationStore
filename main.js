const { app, BrowserWindow, ipcMain } = require('electron');
const path = require("path");

// 1. Uygulama Kimliğini Tanımla (Görev yöneticisi ve bildirimler için)
app.setAppLogsPath(); // Log yolunu ayarlar
app.setName("ValleyStation");
if (process.platform === 'win32') {
    app.setAppUserModelId("ValleyStation");
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 600,
        title: "ValleyStation", // Pencere başlığı
        frame: false,
        transparent: true,
        resizable: false,
        icon: path.join(__dirname, "valleystation.ico"),
        // main.js içindeki webPreferences kısmına ekle
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false,
            allowRunningInsecureContent: true,
            enableRemoteModule: true // Eğer eski bir Electron sürümü kullanıyorsan
        }
    });

    // 2. Pencere başlığını zorla değiştir
    win.setTitle("ValleyStation");
    win.loadFile('index.html');
}

// --- OTOMATİK BAŞLATMA İŞLEVİ ---
ipcMain.on('set-autolaunch', (event, shouldAutoLaunch) => {
    app.setLoginItemSettings({
        openAtLogin: shouldAutoLaunch,
        path: app.getPath('exe') // Uygulamanın .exe yolunu otomatik bulur
    });
    console.log("Auto-launch durumu değiştirildi:", shouldAutoLaunch);
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
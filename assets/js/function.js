const axios = require('axios');

// Giriş kontrolü
function isLoggedIn() {
    const session = localStorage.getItem('session');
    return session !== null;
}

function requireLogin() {
    if (!isLoggedIn()) {
        alert('Bu işlemi yapmak için giriş yapmalısınız!');
        return false;
    }
    return true;
}

// Giriş kontrolü
function isLoggedIn() {
    const session = localStorage.getItem('session');
    return session !== null;
}

function requireLogin() {
    if (!isLoggedIn()) {
        alert('Bu işlemi yapmak için giriş yapmalısınız!');
        return false;
    }
    return true;
}

function checkGameStatus(pageKey) {
    if (!isLoggedIn()) {
        const actionArea = document.getElementById('action-area');
        actionArea.innerHTML = `<button class="btn-play" style="opacity:0.5; cursor:not-allowed;" disabled>GİRİŞ YAPIN</button>`;
        return;
    }

    try {
        const data = pages[pageKey];
        const actionArea = document.getElementById('action-area');

        // __dirname bazen asar içindeyken sapıtabilir, o yüzden tam yolu böyle kuralım:
        const appsDir = path.join(process.cwd(), 'Apps');
        const appPath = path.join(appsDir, pageKey, data.exeName);

        console.log("ARANAN DOSYA YOLU: ", appPath);

        if (fs.existsSync(appPath)) {
            console.log("DOSYA BULUNDU!");
            actionArea.innerHTML = `<button class="btn-play" onclick="launchApp('${pageKey}')">AÇ</button>`;
        } else {
            console.log("DOSYA YOK!");
            actionArea.innerHTML = `<button class="btn-play" onclick="startDownload('${pageKey}')">İNDİR</button>`;
        }
    } catch (err) {
        console.error("Hata:", err);
    }
}

function startDownload(pageKey) {
    if (!requireLogin()) return;

    const data = pages[pageKey];
    const appsRoot = path.join(__dirname, 'Apps');
    const appFolder = path.join(appsRoot, pageKey);
    const rarPath = path.join(appsRoot, `${pageKey}.rar`);

    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    document.getElementById('progress-container').style.display = 'block';
    document.getElementById('action-area').innerHTML = `<button class="btn-play" style="opacity:0.5; cursor:wait;">BEKLEYİN...</button>`;

    if (!fs.existsSync(appFolder)) fs.mkdirSync(appFolder, { recursive: true });

    const file = fs.createWriteStream(rarPath);

    const downloadFile = (url) => {
        https.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                downloadFile(response.headers.location);
                return;
            }

            const totalSize = parseInt(response.headers['content-length'], 10);
            let downloadedSize = 0;

            response.on('data', (chunk) => {
                downloadedSize += chunk.length;
                file.write(chunk);
                if (totalSize) {
                    const percent = Math.round((downloadedSize / totalSize) * 100);
                    progressBar.style.width = percent + "%";
                    progressText.innerText = `%${percent}`;
                }
            });

            response.on('end', () => {
                file.end();
                progressText.innerText = "RAR ÇIKARILIYOR...";

                // ASAR ayarını sadece çıkarma anında kapat
                process.noAsar = true;

                setTimeout(async () => {
                    try {
                        await unrar(rarPath, appFolder);
                        if (fs.existsSync(rarPath)) fs.unlinkSync(rarPath);
                    } catch (err) {
                        alert("Çıkarma Hatası: " + err.message);
                    } finally {
                        // İşlem ne olursa olsun ASAR desteğini geri aç ve butonu güncelle
                        process.noAsar = false;
                        document.getElementById('progress-container').style.display = 'none';
                        checkGameStatus(pageKey);
                    }
                }, 1000);
            });
        }).on('error', (err) => {
            alert("İndirme Hatası: " + err.message);
            checkGameStatus(pageKey);
        });
    };

    downloadFile(data.downloadUrl);
}

function launchApp(pageKey) {
    if (!requireLogin()) return;

    const data = pages[pageKey];
    const actionArea = document.getElementById('action-area');
    const appFolder = path.join(process.cwd(), 'Apps', pageKey);
    const fullExePath = path.join(appFolder, data.exeName);

    // 1. ADIM: Zaten çalışıyor mu kontrol et (Windows Tasklist üzerinden)
    exec(`tasklist /FI "IMAGENAME eq ${data.exeName}"`, (err, stdout) => {
        if (stdout.includes(data.exeName)) {
            // Uygulama zaten listede var
            alert("Bu uygulama zaten çalışıyor!");
            return;
        }

        // 2. ADIM: Butonu kilitle ve ibareyi değiştir
        actionArea.innerHTML = `<button class="btn-play" style="opacity:0.7; cursor:not-allowed;" disabled>AÇILIYOR...</button>`;

        process.noAsar = true;

        // 3. ADIM: Uygulamayı başlat
        const child = exec(`"${fullExePath}"`, { cwd: appFolder }, (error) => {
            if (error) {
                alert("Başlatma Hatası: " + error.message);
                checkGameStatus(pageKey); // Hata varsa butonu eski haline döndür
            }
            process.noAsar = false;
        });

        // 4. ADIM: Uygulama kapandığında butonu tekrar "AÇ" yap (Opsiyonel)
        // Eğer oyun kapandığında launcher butonu düzelsin istersen bunu kullan:
        child.on('exit', () => {
            checkGameStatus(pageKey);
        });

        // Eğer butonu sadece 5 saniye kilitleyip sonra "AÇ"a dönsün istersen:
        /*
        setTimeout(() => {
            checkGameStatus(pageKey);
        }, 5000);
        */
    });
}

async function loginToForum() {
    const user = document.getElementById('username-input').value;
    const pass = document.getElementById('password-input').value;

    if (!user || !pass) return alert("Alanları doldur!");

    try {
        const response = await axios({
            method: 'post',
            url: 'https://forum.nexabag.xyz/api/v2/auth.php',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                username: user,
                password: pass
            },
            timeout: 10000
        });

        if (response.data.success) {
            // Veriyi kaydet
            localStorage.setItem('session', JSON.stringify(response.data.user));

            // SAĞ ÜSTÜ GÜNCELLE
            applyUserSession(response.data.user);

            alert("Giriş başarılı! Hoş geldin " + response.data.user.username);
        } else {
            alert(response.data.message);
        }
    } catch (error) {
        console.error("Hata Detayı:", error);
        console.error("Hata Mesajı:", error.message);
        console.error("Hata Response:", error.response);

        let errorMsg = "Bağlantı hatası!";

        if (error.response) {
            // Sunucu yanıt verdi ama hata kodu döndü (4xx, 5xx)
            errorMsg = `Sunucu hatası: ${error.response.status} - ${error.response.data}`;
        } else if (error.request) {
            // İstek gönderildi ama yanıt alınamadı
            errorMsg = "Sunucuya ulaşılamıyor! İnternet bağlantınızı kontrol edin.";
        } else {
            // İstek hazırlanırken hata oluştu
            errorMsg = "İstek hatası: " + error.message;
        }

        alert(errorMsg);
    }
}

function applyUserSession(userData) {
    // ID'leri HTML'deki karşılıklarıyla güncelledik
    const profileName = document.getElementById('user-display-name');
    const profileImg = document.getElementById('user-display-avatar');

    if (profileName) profileName.innerText = userData.username;

    if (profileImg) {
        // Eğer veritabanında resim varsa onu kullan, yoksa varsayılan resim göster
        profileImg.src = userData.profile_picture || 'varsayilan-profil.png';
    }

    // Paneli gizle
    const loginPanel = document.getElementById('login-panel');
    if (loginPanel) loginPanel.style.display = 'none';
}

const CURRENT_VERSION = "26.1-beta.2";
// BAŞINDAKİ HTTPS'YE VE DOSYA ADINA DİKKAT
const GITHUB_RAW_JSON = "https://raw.githubusercontent.com/SiberizmBey/ValleyStationStore/main/version.json";

async function checkUpdates() {
    const statusArea = document.getElementById('update-status');
    const GITHUB_RAW = "https://raw.githubusercontent.com/SiberizmBey/ValleyStationStore/main/verison.json";

    try {
        const response = await fetch(`${GITHUB_RAW}?t=${Date.now()}`);
        const data = await response.json();

        const serverVersion = data.version.trim();
        const localVersion = CURRENT_VERSION.trim();

        if (serverVersion !== localVersion) {
            // Yeni sürüm varsa şık bir panel göster
            statusArea.innerHTML = `
                <div class="update-card">
                    <div class="update-status-text">
                        <i class="fa fa-info-circle"></i> Yeni sürüm mevcut: <b>${serverVersion}</b>
                    </div>
                    <button class="btn-update" onclick="window.open('${data.download_url}', '_blank')">
                        <i class="fa fa-download"></i> GÜNCELLE
                    </button>
                </div>`;
        } else {
            // Güncelse sadece bilgi ver
            statusArea.innerHTML = `
                <div class="update-status-text" style="color: #666;">
                    <i class="fa fa-check-circle"></i> Sistem güncel (v${localVersion})
                </div>`;
        }
    } catch (e) {
        statusArea.innerText = "Sunucuya bağlanılamadı.";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Sayfa açılır açılmaz kurulu olan sürümü footer'a yazdırır
    const footerSpan = document.getElementById('app-version-footer');
    if (footerSpan) {
        footerSpan.innerText = "v" + CURRENT_VERSION;
    }

    // Güncelleme kontrolünü başlat (Arka planda GitHub'a bakar)
    checkUpdates();
});

// HTML'deki checkbox'ı seçiyoruz
const startupCheckbox = document.getElementById('startup-checkbox');

// Sayfa yüklendiğinde hafızadaki ayarı kontrol et
if (localStorage.getItem('startup') === 'true') {
    startupCheckbox.checked = true;
}

// Tıklandığında hem hafızaya kaydet hem Electron'a bildir
startupCheckbox.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    localStorage.setItem('startup', isChecked);

    // Electron'un ipcRenderer modülünü kullanarak ana sürece mesaj gönder
    const { ipcRenderer } = require('electron');
    ipcRenderer.send('set-autolaunch', isChecked);
});
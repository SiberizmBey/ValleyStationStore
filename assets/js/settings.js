// Discord tarzı tam ekran ayarlar popup'ı için JS
function openSettings() {
    document.getElementById('settings-overlay').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}
function closeSettings() {
    document.getElementById('settings-overlay').style.display = 'none';
    document.body.style.overflow = '';
}
// Tema yönetimi ve başlangıçta çalıştır kodları index.html içindeki script ile aynı şekilde buraya taşınabilir.

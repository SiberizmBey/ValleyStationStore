const fs = require('fs');
const path = require('path');
const https = require('https');
const { unrar } = require('unrar-promise');
const { exec } = require('child_process');

const pages = {
    'classic': {
        title: 'WEB',
        desc: 'Web tarayıcısına erişim sağlayın.',
        bg: 'https://forum.nexabag.xyz/assets/img/mockups/nexaandroid.png',
        downloadUrl: 'BURAYA_LINK',
        exeName: 'classic.exe'
    },
    'windows': {
        title: 'WINDOWS',
        desc: 'Windows Edition ile optimize performans.',
        bg: 'https://forum.nexabag.xyz/assets/img/mockups/nexawindows.png',
        downloadUrl: 'https://github.com/SiberizmBey/NexaVerse-App/releases/download/v26.1-Windows/NexaVerse.Windows.rar',
        // Eğer RAR içinden 'windows' klasörü çıkıyorsa yolu böyle yap:
        exeName: 'NexaVerse.exe'
    },
    'superwheel': {
        title: 'Super Wheel',
        desc: 'Akıllı Mouse Tekerleği',
        bg: 'https://forum.nexabag.xyz/assets/img/superwheel.jpg',
        downloadUrl: 'https://github.com/SiberizmBey/SuperWheel/releases/download/v1.0.1/SuperWheel_1.0.1.rar',
        // Eğer RAR içinden 'windows' klasörü çıkıyorsa yolu böyle yap:
        exeName: 'SuperWheel.exe'
    },
     'blink': {
        title: 'Blink',
        desc: 'Hepsi bir arada mesajlaşma uygulaması',
        bg: 'https://forum.nexabag.xyz/assets/img/mockups/blink.png',
        downloadUrl: 'https://github.com/SiberizmBey/BlinkMes/releases/download/v1.0.0/Blink_1.0.0.rar',
        // Eğer RAR içinden 'windows' klasörü çıkıyorsa yolu böyle yap:
        exeName: 'Blink.exe'
    }
};

function changePage(pageKey, element) {
    // AYARLARI KAPATAN KISIM BURASI:
    // Hangi sayfaya geçersen geç, önce ayarlar panelini gizliyoruz.
    document.getElementById('settings-page').style.display = 'none';
    document.getElementById('page-content').style.display = 'block';

    // Eğer ayarlar butonuna basıldıysa özel işlem yap
    if (pageKey === 'settings') {
        document.getElementById('page-content').style.display = 'none';
        document.getElementById('settings-page').style.display = 'block';
    }

    // Senin orijinal kodun (Data çekme ve görselleştirme)
    const data = pages[pageKey];
    if (data) {
        document.getElementById('mainBg').style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url('${data.bg}')`;
        document.getElementById('mainTitle').innerText = data.title;
        document.getElementById('mainDesc').innerText = data.desc;
        checkGameStatus(pageKey);
    }

    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    element.classList.add('active');
}

window.onload = () => { checkGameStatus('classic'); };
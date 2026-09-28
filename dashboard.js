// ==========================================
// 1. SATPAM (GUARD): CEK LOGIN
// ==========================================
const dbUrl = localStorage.getItem('iot_db_url');
const dbSecret = localStorage.getItem('iot_db_secret');
const userId = localStorage.getItem('iot_user_id');

if (!dbUrl || !dbSecret || !userId) {
    window.location.href = 'login.html';
}
// ==========================================
// HELPER: CEK VISIBILITAS WIDGET
// ==========================================
function isWidgetVisible(key) {
    const savedSettings = JSON.parse(localStorage.getItem('iot_widget_visibility')) || {};
    // Jika tidak ada di settings, tampilkan secara default
    return savedSettings.hasOwnProperty(key) ? savedSettings[key] : true;
}

// Tampilkan User ID di Header (Tanpa Emot)
const userDisplay = document.getElementById('user-display');
if (userDisplay) {
    userDisplay.textContent = `Pengguna: ${userId}`;
}

const container = document.getElementById('dynamic-dashboard');
let pollingInterval = null;

// ==========================================
// HELPER: Mapping key ke label teks yang rapi (Tanpa Emot)
// ==========================================
function getHumanLabel(key) {
    // Murni format string: ganti underscore dengan spasi, lalu kapitalisasi huruf pertama setiap kata
    // Contoh: "suhu_kamar" -> "Suhu Kamar"
    // Contoh: "gauge1" -> "Gauge1"
    // Contoh: "sensor_cahaya_baru" -> "Sensor Cahaya Baru"
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// ==========================================
// 2. FUNGSI KIRIM DATA (SAKELAR)
// ==========================================
function sendData(key, value) {
    const cleanUrl = dbUrl.replace(/\/+$/, "");
    const url = `${cleanUrl}/${userId}/${key}.json?auth=${dbSecret}`;
    
    fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value)
    }).catch(err => console.error("Error mengirim data:", err));
}

// ==========================================
// 3. FUNGSI UTAMA: AMBIL DATA & RENDER DINAMIS
// ==========================================
async function fetchAndRenderDashboard() {
    try {
        const cleanUrl = dbUrl.replace(/\/+$/, "");
        const url = `${cleanUrl}/${userId}.json?auth=${dbSecret}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        if (!data) return;

        // Hapus pesan loading jika ada
        const loadingMsg = container.querySelector('.loading-text');
        if (loadingMsg) loadingMsg.remove();

        // LOOPING SEMUA DATA DI FIREBASE
        // Di dalam fungsi fetchAndRenderDashboard, tepat setelah loop Object.keys(data).forEach(...)
        Object.keys(data).forEach(key => {
            // CEK VISIBILITAS DI SINI
            if (!isWidgetVisible(key)) {
                // Jika widget tidak boleh tampil, hapus dari DOM jika ada
                const existingWidget = document.getElementById(`widget-${key}`);
                if (existingWidget) existingWidget.remove();
                return; // Skip proses rendering
            }
        
            const value = data[key];
            const type = typeof value;
            
            // Cek apakah widget sudah ada di layar
            let widgetEl = document.getElementById(`widget-${key}`);

            // Jika BELUM ADA, buat widget baru berdasarkan TIPE DATA
            if (!widgetEl) {
                let html = '';
                
                if (type === 'boolean') {
                    html = createSwitchWidget(key, value);
                } 
                else if (type === 'number') {
                    if (key.includes('hlevel') || key.includes('jarak') || key.includes('ketinggian')) {
                        html = createHLevelWidget(key, value);
                    } else {
                        html = createGaugeWidget(key, value);
                    }
                } 
                else if (type === 'string') {
                    html = createIndicatorWidget(key, value);
                }

                if (html) {
                    container.insertAdjacentHTML('beforeend', html);
                    widgetEl = document.getElementById(`widget-${key}`);
                }
            }

            // UPDATE NILAI (Anti-Flicker: hanya update isi, bukan recreate)
            if (widgetEl) {
                updateWidgetValue(widgetEl, key, value, type);
            }
		


        });

    } catch (error) {
        console.error("Gagal mengambil data:", error);
    }
}

// ==========================================
// 4. PABRIK WIDGET (TEMPLATE HTML - TANPA EMOT)
// ==========================================
function createGaugeWidget(key, value) {
    const numValue = typeof value === 'number' ? value : 0;
    const percentage = Math.min((numValue / 100) * 100, 100);
    const offset = 283 - (283 * percentage / 100);
    const label = getHumanLabel(key);
    
    return `
    <div class="widget gauge-widget" id="widget-${key}">
        <div class="widget-header">
            <span class="widget-title">${label}</span>
            <span class="widget-value">${numValue}</span>
        </div>
        <div class="gauge-container">
            <div class="gauge-circle">
                <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" class="gauge-bg"/>
                    <circle cx="50" cy="50" r="45" class="gauge-fill" style="stroke-dashoffset: ${offset};"></circle>
                </svg>
                <div class="gauge-text">
                    <span>${numValue}</span>
                    <small>unit</small>
                </div>
            </div>
        </div>
    </div>`;
}

function createHLevelWidget(key, value) {
    const numValue = typeof value === 'number' ? value : 0;
    const percentage = Math.min((numValue / 200) * 100, 100);
    const label = getHumanLabel(key);
    
    return `
    <div class="widget hlevel-widget" id="widget-${key}">
        <div class="widget-header">
            <span class="widget-title">${label}</span>
            <span class="widget-value">${numValue}</span>
        </div>
        <div class="hlevel-bar">
            <div class="hlevel-fill" style="width: ${percentage}%;"></div>
        </div>
        <div class="hlevel-label">
            <span>0</span>
            <span>${numValue}</span>
            <span>Maks</span>
        </div>
    </div>`;
}

function createIndicatorWidget(key, value) {
    const label = getHumanLabel(key);
    return `
    <div class="widget indicator-widget" id="widget-${key}">
        <div class="widget-header">
            <span class="widget-title">${label}</span>
        </div>
        <div class="indicator-content">
            <span class="indicator-text">${value}</span>
        </div>
    </div>`;
}

function createSwitchWidget(key, value) {
    const isChecked = (value === true || value === "true") ? 'checked' : '';
    const label = getHumanLabel(key);
    
    return `
    <div class="widget switch-widget" id="widget-${key}">
        <div class="widget-header">
            <span class="widget-title">${label}</span>
        </div>
        <div class="switch-container">
            <label class="switch">
                <input type="checkbox" id="toggle-${key}" ${isChecked}>
                <span class="slider"></span>
            </label>
        </div>
    </div>`;
}

// ==========================================
// 5. FUNGSI UPDATE NILAI (ANTI-FLICKER)
// ==========================================
function updateWidgetValue(widgetEl, key, value, type) {
    if (type === 'number') {
        const numValue = typeof value === 'number' ? value : 0;
        
        if (widgetEl.classList.contains('gauge-widget')) {
            const percentage = Math.min((numValue / 100) * 100, 100);
            const offset = 283 - (283 * percentage / 100);
            const circle = widgetEl.querySelector('.gauge-fill');
            const text = widgetEl.querySelector('.gauge-text span');
            const valDisplay = widgetEl.querySelector('.widget-value');
            
            if (circle) circle.style.strokeDashoffset = offset;
            if (text) text.textContent = numValue;
            if (valDisplay) valDisplay.textContent = numValue;
        } 
        else if (widgetEl.classList.contains('hlevel-widget')) {
            const percentage = Math.min((numValue / 200) * 100, 100);
            const fill = widgetEl.querySelector('.hlevel-fill');
            const text = widgetEl.querySelector('.hlevel-label span:nth-child(2)');
            const valDisplay = widgetEl.querySelector('.widget-value');
            
            if (fill) fill.style.width = `${percentage}%`;
            if (text) text.textContent = numValue;
            if (valDisplay) valDisplay.textContent = numValue;
        }
    } 
    else if (type === 'string') {
        const text = widgetEl.querySelector('.indicator-text');
        if (text) text.textContent = value;
    } 
    else if (type === 'boolean') {
        const toggle = widgetEl.querySelector('input[type="checkbox"]');
        if (toggle) {
            const isChecked = (value === true || value === "true");
            if (toggle.checked !== isChecked) {
                toggle.checked = isChecked;
            }
        }
    }
}

// ==========================================
// 6. EVENT DELEGATION (Sakelar)
// ==========================================
container.addEventListener('change', (e) => {
    if (e.target.matches('input[type="checkbox"]')) {
        const key = e.target.id.replace('toggle-', '');
        sendData(key, e.target.checked);
    }
});

// ==========================================
// 7. LOGOUT
// ==========================================
function logout() {
    console.log("Logout diklik!");
    localStorage.removeItem('iot_db_url');
    localStorage.removeItem('iot_db_secret');
    localStorage.removeItem('iot_user_id');
    if (pollingInterval) clearInterval(pollingInterval);
    window.location.href = 'login.html';
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

// ==========================================
// 8. JALANKAN SAAT HALAMAN DIMUAT
// ==========================================
console.log("Dashboard diinisialisasi untuk pengguna:", userId);
fetchAndRenderDashboard(); // Panggil sekali di awal

// Polling setiap 3 detik
pollingInterval = setInterval(fetchAndRenderDashboard, 3000);

// ==========================================
// FUNGSI DOWNLOAD KODE ARDUINO OTOMATIS
// ==========================================
function downloadArduinoCode() {
    const moduleKey = document.getElementById('moduleSelect').value;
    
    // 1. Validasi
    if (!moduleKey) {
        alert('⚠️ Silakan pilih modul terlebih dahulu!');
        return;
    }
    if (!ARDUINO_TEMPLATES[moduleKey]) {
        alert('❌ Template kode untuk modul ini belum tersedia.');
        return;
    }

    // 2. Ambil data user dari LocalStorage
    const wifiSsid = localStorage.getItem('iot_wifi_ssid') || 'UMS Wifi';
    const wifiPass = localStorage.getItem('iot_wifi_pass') || 'ums.wifi';
    const dbUrl = localStorage.getItem('iot_db_url');
    const dbSecret = localStorage.getItem('iot_db_secret');
    const userId = localStorage.getItem('iot_user_id');

    // 3. Racik Kode (Replace Placeholder)
    let finalCode = ARDUINO_TEMPLATES[moduleKey];
    finalCode = finalCode.replaceAll('{{WIFI_SSID}}', wifiSsid);
    finalCode = finalCode.replaceAll('{{WIFI_PASSWORD}}', wifiPass);
    finalCode = finalCode.replaceAll('{{DATABASE_URL}}', dbUrl);
    finalCode = finalCode.replaceAll('{{API_KEY}}', dbSecret);
    finalCode = finalCode.replaceAll('{{USER_ID}}', userId);

    // 4. Buat File Blob dan Trigger Download
    const blob = new Blob([finalCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    // Nama file otomatis: modul04_latif_2023-10-25.ino
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `${moduleKey}_${userId}_${date}.ino`;
    
    document.body.appendChild(a);
    a.click(); // Eksekusi download
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Bersihkan memori
    
    console.log(`✅ Kode ${moduleKey} berhasil diracik dan diunduh!`);
}
// ==========================================
// FUNGSI AUTO-POPULATE DROPDOWN MODUL
// ==========================================
function populateModuleDropdown() {
    const select = document.getElementById('moduleSelect');
    if (!select || typeof ARDUINO_TEMPLATES === 'undefined') return;
    
    // Hapus semua opsi kecuali yang pertama (default)
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // Mapping label yang rapi untuk setiap key modul
    const moduleLabels = {
        "modul04": "Modul 04 - LED, Buzzer, Relay",
        "modul05LCD": "Modul 05 - LCD 16x2 I2C",
        "modul05OLED": "Modul 05 - OLED Display 128x64",
        "modul06LDR": "Modul 06 - Sensor Cahaya LDR",
        "modul06BH1750": "Modul 06 - Sensor Cahaya BH1750",
        "modul06POTENSI": "Modul 06 - Potensiometer",
        "modul07DHT": "Modul 07 - DHT11 (Suhu & Kelembaban)",
        "modul08": "Modul 08 - BMP180 (Cuaca & Ketinggian)",
        "modul09": "Modul 09 - Smart Agriculture (Tanah/Hujan)",
        "modul10PIR": "Modul 10 - Sensor PIR (Gerakan)",
        "modul10BAG02": "Modul 10 - Sensor Ultrasonik (Jarak)",
        "modul11": "Modul 11 - Motor Servo",
        "modul12": "Modul 12 - RFID MFRC522",
        "modul13REG": "Modul 13 - Fingerprint (Enroll/Daftar)",
        "modul13READ": "Modul 13 - Fingerprint (Read/Verifikasi)",
        "modul13DEL": "Modul 13 - Fingerprint (Delete/Hapus)",
        "modul14": "Modul 14 - Sensor Gesture APDS9960"
    };
    
    // Loop semua keys di ARDUINO_TEMPLATES dan buat option
    Object.keys(ARDUINO_TEMPLATES).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        // Pakai label dari mapping, kalau tidak ada pakai key-nya langsung
        option.textContent = moduleLabels[key] || key;
        select.appendChild(option);
    });
    
    console.log(`✅ Dropdown modul terisi: ${Object.keys(ARDUINO_TEMPLATES).length} modul tersedia`);
}

// Panggil fungsi ini saat halaman dimuat
// Tambahkan di bagian paling bawah dashboard.js, setelah pollingInterval:
populateModuleDropdown();

// ==========================================
// FUNGSI DOWNLOAD SEMUA MODUL (.ZIP)
// ==========================================
async function downloadAllModules() {
    const statusEl = document.getElementById('download-status');
    statusEl.style.display = 'block';
    statusEl.textContent = '⏳ Sedang meracik file ZIP... Mohon tunggu.';

    try {
        // 1. Ambil data user dari LocalStorage
        const wifiSsid = localStorage.getItem('iot_wifi_ssid') || 'UMS Wifi';
        const wifiPass = localStorage.getItem('iot_wifi_pass') || 'ums.wifi';
        const dbUrl = localStorage.getItem('iot_db_url');
        const dbSecret = localStorage.getItem('iot_db_secret');
        const userId = localStorage.getItem('iot_user_id');

        // 2. Inisialisasi JSZip
        const zip = new JSZip();

        // 3. Mapping struktur folder agar sesuai dengan file 'semua_modul.txt' kamu
        const folderStructure = {
            "modul04": "modul04/modul04.ino",
            "modul05LCD": "modul05/modul05LCD.ino",
            "modul05OLED": "modul05/modul05OLED.ino",
            "modul06BH1750": "modul06/modul06BH1750.ino",
            "modul06LDR": "modul06/modul06LDR.ino",
            "modul06POTENSI": "modul06/modul06POTENSI.ino",
            "modul07DHT": "modul07/modul07DHT.ino",
            "modul08": "modul08/modul08.ino",
            "modul09": "modul09/modul09.ino",
            "modul10BAG02": "modul10/modul10BAG02.ino",
            "modul10PIR": "modul10/modul10PIR.ino",
            "modul11": "modul11/modul11.ino",
            "modul12": "modul12/modul12.ino",
            "modul13DEL": "modul13/modul13DEL.ino",
            "modul13READ": "modul13/modul13READ.ino",
            "modul13REG": "modul13/modul13REG.ino",
            "modul14": "modul14/modul14.ino"
        };

        // 4. Loop semua template, replace variabel, dan masukkan ke ZIP
        for (const [key, template] of Object.entries(ARDUINO_TEMPLATES)) {
            let finalCode = template
                .replaceAll('{{WIFI_SSID}}', wifiSsid)
                .replaceAll('{{WIFI_PASSWORD}}', wifiPass)
                .replaceAll('{{DATABASE_URL}}', dbUrl)
                .replaceAll('{{API_KEY}}', dbSecret)
                .replaceAll('{{USER_ID}}', userId);

            // Tentukan nama file & folder. Jika tidak ada di mapping, pakai default
            const filePath = folderStructure[key] || `${key}/${key}.ino`;
            
            // Tambahkan file ke dalam objek ZIP
            zip.file(filePath, finalCode);
        }

        // 5. Generate file ZIP secara asynchronous
        const content = await zip.generateAsync({ type: "blob" });
        
        // 6. Trigger download menggunakan FileSaver.js
        const date = new Date().toISOString().slice(0, 10);
        saveAs(content, `Kode_Arduino_Lengkap_${userId}_${date}.zip`);

        statusEl.textContent = '✅ Berhasil! File ZIP telah diunduh.';
        setTimeout(() => { statusEl.style.display = 'none'; }, 3000);

    } catch (error) {
        console.error("Gagal membuat ZIP:", error);
        statusEl.textContent = '❌ Gagal membuat file ZIP. Cek console untuk detail.';
        statusEl.style.color = 'var(--danger)';
    }
}
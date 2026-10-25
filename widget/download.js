 // download.js

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
// 2. VARIABEL GLOBAL & HELPER TEMPLATE
// ==========================================
let activeTemplateSource = 'v3'; // Default: Firebase v3.x

function getActiveTemplates() {
    if (activeTemplateSource === 'v4' && typeof ARDUINO_TEMPLATES_V4 !== 'undefined') {
        return ARDUINO_TEMPLATES_V4;
    }
    return ARDUINO_TEMPLATES; 
}

// ==========================================
// 3. FUNGSI SWITCH VERSI (v3.x vs v4.x)
// ==========================================
function switchVersion(version) {
    activeTemplateSource = version;
    
    const btnV3 = document.getElementById('tab-v3');
    const btnV4 = document.getElementById('tab-v4');
    
    // Reset style semua tombol
    [btnV3, btnV4].forEach(btn => {
        btn.classList.remove('active');
    });

    // Set active style
    const activeBtn = version === 'v3' ? btnV3 : btnV4;
    activeBtn.classList.add('active');
    
    // Refresh dropdown dengan data dari versi yang baru dipilih
    populateModuleDropdown();
    console.log(`✅ Beralih ke Firebase ${version}.x`);
}

// ==========================================
// 4. CUSTOM DROPDOWN LOGIC
// ==========================================
function initCustomDropdown() {
    const nativeSelect = document.getElementById('moduleSelect');
    const customDropdown = document.getElementById('customModuleDropdown');
    
    if (!nativeSelect || !customDropdown) return; 

    const trigger = customDropdown.querySelector('.nerv-dropdown-trigger');
    const valueSpan = customDropdown.querySelector('.nerv-dropdown-value');
    const optionsContainer = customDropdown.querySelector('.nerv-dropdown-options');

    optionsContainer.addEventListener('click', (e) => {
        const optionEl = e.target.closest('.nerv-option');
        if (!optionEl) return;

        nativeSelect.value = optionEl.dataset.value;
        valueSpan.textContent = optionEl.textContent;
        optionsContainer.querySelectorAll('.nerv-option').forEach(opt => opt.classList.remove('selected'));
        optionEl.classList.add('selected');
        customDropdown.classList.remove('active');
    });

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        customDropdown.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!customDropdown.contains(e.target)) {
            customDropdown.classList.remove('active');
        }
    });
}

function populateModuleDropdown() {
    const nativeSelect = document.getElementById('moduleSelect');
    const customOptionsContainer = document.querySelector('.nerv-dropdown-options');
    const valueSpan = document.querySelector('.nerv-dropdown-value');
    
    const templates = getActiveTemplates();
    if (!nativeSelect || !customOptionsContainer || !templates) return;
    
    nativeSelect.innerHTML = '<option value="">-- Pilih Modul Satuan --</option>';
    customOptionsContainer.innerHTML = '';
    valueSpan.textContent = '-- Pilih Modul Satuan --';

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
        "modul13REG": "Modul 13 - Fingerprint (Enroll)",
        "modul13READ": "Modul 13 - Fingerprint (Read)",
        "modul13DEL": "Modul 13 - Fingerprint (Delete)",
        "modul14": "Modul 14 - Sensor Gesture APDS9960"
    };
    
    Object.keys(templates).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = moduleLabels[key] || key;
        nativeSelect.appendChild(option);
        
        const customOption = document.createElement('div');
        customOption.className = 'nerv-option';
        customOption.dataset.value = key;
        customOption.textContent = moduleLabels[key] || key;
        customOptionsContainer.appendChild(customOption);
    });
}

// ==========================================
// 5. FUNGSI DOWNLOAD
// ==========================================
function downloadArduinoCode() {
    const moduleKey = document.getElementById('moduleSelect').value;
    const templates = getActiveTemplates();
    
    if (!moduleKey || !templates[moduleKey]) {
        alert('⚠️ Silakan pilih modul yang valid!');
        return;
    }

    let finalCode = templates[moduleKey]
        .replaceAll('{{WIFI_SSID}}', localStorage.getItem('iot_wifi_ssid') || 'UMS Wifi')
        .replaceAll('{{WIFI_PASSWORD}}', localStorage.getItem('iot_wifi_pass') || 'ums.wifi')
        .replaceAll('{{DATABASE_URL}}', dbUrl)
        .replaceAll('{{API_KEY}}', dbSecret)
        .replaceAll('{{USER_ID}}', userId);

    const blob = new Blob([finalCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${moduleKey}_${userId}_${new Date().toISOString().slice(0, 10)}_v${activeTemplateSource}.ino`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function downloadAllModules() {
    const statusEl = document.getElementById('download-status');
    if (statusEl) {
        statusEl.style.display = 'block';
        statusEl.className = 'status-message loading';
        statusEl.textContent = `⏳ Sedang meracik file ZIP (v${activeTemplateSource}.x)... Mohon tunggu.`;
    }

    try {
        const zip = new JSZip();
        const templates = getActiveTemplates();
        const replacements = {
            '{{WIFI_SSID}}': localStorage.getItem('iot_wifi_ssid') || 'UMS Wifi',
            '{{WIFI_PASSWORD}}': localStorage.getItem('iot_wifi_pass') || 'ums.wifi',
            '{{DATABASE_URL}}': dbUrl,
            '{{API_KEY}}': dbSecret,
            '{{USER_ID}}': userId
        };

        for (const [key, template] of Object.entries(templates)) {
            let finalCode = template;
            for (const [placeholder, value] of Object.entries(replacements)) {
                finalCode = finalCode.replaceAll(placeholder, value);
            }
            zip.file(`${key}/${key}.ino`, finalCode);
        }

        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `Kode_Arduino_Lengkap_v${activeTemplateSource}_${userId}_${new Date().toISOString().slice(0, 10)}.zip`);

        if (statusEl) {
            statusEl.className = 'status-message success';
            statusEl.textContent = `✅ Berhasil! File ZIP (v${activeTemplateSource}.x) telah diunduh.`;
            setTimeout(() => { statusEl.style.display = 'none'; }, 3000);
        }
    } catch (error) {
        console.error("Gagal membuat ZIP:", error);
        if (statusEl) {
            statusEl.className = 'status-message error';
            statusEl.textContent = '❌ Gagal membuat file ZIP.';
        }
    }
}

// ==========================================
// 6. INISIALISASI
// ==========================================
console.log("Halaman Download diinisialisasi untuk pengguna:", userId);

initCustomDropdown();
populateModuleDropdown();
switchVersion('v3'); // Default ke v3.x

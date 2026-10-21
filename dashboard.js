// ==========================================
// 1. SATPAM (GUARD): CEK LOGIN
// ==========================================
const dbUrl = localStorage.getItem('iot_db_url');
const dbSecret = localStorage.getItem('iot_db_secret');
const userId = localStorage.getItem('iot_user_id');

if (!dbUrl || !dbSecret || !userId) {
    window.location.href = 'login.html';
}

// Tampilkan User ID di Header
const userDisplay = document.getElementById('user-display');
if (userDisplay) {
    userDisplay.textContent = `${userId}`;
}

const container = document.getElementById('dynamic-dashboard');
let pollingInterval = null;

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
    
    const inactiveStyle = { background: 'transparent', color: 'var(--text-secondary, #ccc)' };
    const activeStyle = { background: 'var(--gradient-accent, linear-gradient(135deg, #FFD700, #FFA500))', color: 'var(--nerv-black, #1e3c72)' };
    
    if (version === 'v3') {
        Object.assign(btnV3.style, activeStyle);
        Object.assign(btnV4.style, inactiveStyle);
    } else {
        Object.assign(btnV4.style, activeStyle);
        Object.assign(btnV3.style, inactiveStyle);
    }
    
    // Refresh dropdown dengan data dari versi yang baru dipilih
    populateModuleDropdown();
    console.log(`✅ Beralih ke Firebase ${version}.x`);
}

// ==========================================
// 4. HELPER: CEK VISIBILITAS & LABEL WIDGET
// ==========================================
function isWidgetVisible(key) {
    const savedSettings = JSON.parse(localStorage.getItem('iot_widget_visibility')) || {};
    return savedSettings.hasOwnProperty(key) ? savedSettings[key] : true;
}

function getHumanLabel(key) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// ==========================================
// 5. FUNGSI KIRIM & AMBIL DATA (FIREBASE)
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

async function fetchAndRenderDashboard() {
    try {
        const cleanUrl = dbUrl.replace(/\/+$/, "");
        const url = `${cleanUrl}/${userId}.json?auth=${dbSecret}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        if (!data) return;

        const loadingMsg = container.querySelector('.loading-text');
        if (loadingMsg) loadingMsg.remove();

        Object.keys(data).forEach(key => {
            if (!isWidgetVisible(key)) {
                const existingWidget = document.getElementById(`widget-${key}`);
                if (existingWidget) existingWidget.remove();
                return; 
            }
        
            const value = data[key];
            const type = typeof value;
            let widgetEl = document.getElementById(`widget-${key}`);

            if (!widgetEl) {
                let html = '';
                if (type === 'boolean') html = createSwitchWidget(key, value);
                else if (type === 'number') {
                    if (key.includes('hlevel') || key.includes('jarak') || key.includes('ketinggian')) {
                        html = createHLevelWidget(key, value);
                    } else {
                        html = createGaugeWidget(key, value);
                    }
                } 
                else if (type === 'string') {
                    if (key.startsWith('display')) html = createDisplayWidget(key, value);
                    else html = createIndicatorWidget(key, value);
                }

                if (html) {
                    container.insertAdjacentHTML('beforeend', html);
                    widgetEl = document.getElementById(`widget-${key}`);
                }
            }

            if (widgetEl) updateWidgetValue(widgetEl, key, value, type);
        });
    } catch (error) {
        console.error("Gagal mengambil data:", error);
    }
}

// ==========================================
// 6. PABRIK WIDGET (TEMPLATE HTML)
// ==========================================
function createGaugeWidget(key, value) {
    const numValue = typeof value === 'number' ? value : 0;
    const percentage = Math.min((numValue / 100) * 100, 100);
    const offset = 283 - (283 * percentage / 100);
    return `
    <div class="widget gauge-widget" id="widget-${key}">
        <div class="widget-header"><span class="widget-title">${getHumanLabel(key)}</span><span class="widget-value">${numValue}</span></div>
        <div class="gauge-container">
            <div class="gauge-circle">
                <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" class="gauge-bg"/><circle cx="50" cy="50" r="45" class="gauge-fill" style="stroke-dashoffset: ${offset};"></circle></svg>
                <div class="gauge-text"><span>${numValue}</span><small>unit</small></div>
            </div>
        </div>
    </div>`;
}

function createHLevelWidget(key, value) {
    const numValue = typeof value === 'number' ? value : 0;
    const percentage = Math.min((numValue / 200) * 100, 100);
    return `
    <div class="widget hlevel-widget" id="widget-${key}">
        <div class="widget-header"><span class="widget-title">${getHumanLabel(key)}</span><span class="widget-value">${numValue}</span></div>
        <div class="hlevel-bar"><div class="hlevel-fill" style="width: ${percentage}%;"></div></div>
        <div class="hlevel-label"><span>0</span><span>${numValue}</span><span>Maks</span></div>
    </div>`;
}

function createIndicatorWidget(key, value) {
    return `<div class="widget indicator-widget" id="widget-${key}">
        <div class="widget-header"><span class="widget-title">${getHumanLabel(key)}</span></div>
        <div class="indicator-content"><span class="indicator-text">${value}</span></div>
    </div>`;
}

function createDisplayWidget(key, value) {
    return `<div class="widget display-widget" id="widget-${key}">
        <div class="widget-header"><span class="widget-title">${getHumanLabel(key)}</span><span class="display-status" id="status-${key}"></span></div>
        <div class="display-content">
            <input type="text" class="display-input" id="input-${key}" value="${value || ''}" placeholder="Ketik pesan..." data-key="${key}">
        </div>
    </div>`;
}

function createSwitchWidget(key, value) {
    const isChecked = (value === true || value === "true") ? 'checked' : '';
    return `<div class="widget switch-widget" id="widget-${key}">
        <div class="widget-header"><span class="widget-title">${getHumanLabel(key)}</span></div>
        <div class="switch-container">
            <label class="switch"><input type="checkbox" id="toggle-${key}" ${isChecked}><span class="slider"></span></label>
        </div>
    </div>`;
}

// ==========================================
// 7. UPDATE NILAI & EVENT DELEGATION
// ==========================================
function updateWidgetValue(widgetEl, key, value, type) {
    if (type === 'number') {
        const numValue = typeof value === 'number' ? value : 0;
        if (widgetEl.classList.contains('gauge-widget')) {
            const percentage = Math.min((numValue / 100) * 100, 100);
            widgetEl.querySelector('.gauge-fill').style.strokeDashoffset = 283 - (283 * percentage / 100);
            widgetEl.querySelector('.gauge-text span').textContent = numValue;
            widgetEl.querySelector('.widget-value').textContent = numValue;
        } else if (widgetEl.classList.contains('hlevel-widget')) {
            const percentage = Math.min((numValue / 200) * 100, 100);
            widgetEl.querySelector('.hlevel-fill').style.width = `${percentage}%`;
            widgetEl.querySelector('.hlevel-label span:nth-child(2)').textContent = numValue;
            widgetEl.querySelector('.widget-value').textContent = numValue;
        }
    } else if (type === 'string') {
        if (key.startsWith('display')) {
            const input = widgetEl.querySelector('.display-input');
            if (input && document.activeElement !== input) input.value = value;
        } else {
            const text = widgetEl.querySelector('.indicator-text');
            if (text) text.textContent = value;
        }
    } else if (type === 'boolean') {
        const toggle = widgetEl.querySelector('input[type="checkbox"]');
        if (toggle && toggle.checked !== (value === true || value === "true")) {
            toggle.checked = (value === true || value === "true");
        }
    }
}

container.addEventListener('change', (e) => {
    if (e.target.matches('input[type="checkbox"]')) {
        sendData(e.target.id.replace('toggle-', ''), e.target.checked);
    }
});

container.addEventListener('input', (e) => {
    if (e.target.matches('.display-input')) {
        const key = e.target.getAttribute('data-key');
        if (window.displayTimeouts && window.displayTimeouts[key]) clearTimeout(window.displayTimeouts[key]);
        if (!window.displayTimeouts) window.displayTimeouts = {};
        window.displayTimeouts[key] = setTimeout(() => {
            sendData(key, e.target.value);
            showSendStatus(key, 'sent');
        }, 800);
    }
});

container.addEventListener('keypress', (e) => {
    if (e.target.matches('.display-input') && e.key === 'Enter') {
        e.preventDefault();
        const key = e.target.getAttribute('data-key');
        sendData(key, e.target.value);
        showSendStatus(key, 'sent');
        e.target.blur();
    }
});

function showSendStatus(key, status) {
    const statusEl = document.getElementById(`status-${key}`);
    if (!statusEl) return;
    if (status === 'sent') {
        statusEl.innerHTML = '✓';
        statusEl.style.color = '#28a745';
        setTimeout(() => { statusEl.innerHTML = ''; }, 1500);
    }
}

// ==========================================
// 8. CUSTOM DROPDOWN & DOWNLOAD LOGIC
// ==========================================

function initCustomDropdown() {
    const nativeSelect = document.getElementById('moduleSelect');
    const customDropdown = document.getElementById('customModuleDropdown');
    
    if (!nativeSelect || !customDropdown) return; 

    const trigger = customDropdown.querySelector('.nerv-dropdown-trigger');
    const valueSpan = customDropdown.querySelector('.nerv-dropdown-value');
    const optionsContainer = customDropdown.querySelector('.nerv-dropdown-options');

    // Saat opsi diklik
    optionsContainer.addEventListener('click', (e) => {
        const optionEl = e.target.closest('.nerv-option');
        if (!optionEl) return;

        // UPDATE NILAI KE SELECT ASLI (Ini kuncinya!)
        nativeSelect.value = optionEl.dataset.value;
        
        // Update tampilan UI
        valueSpan.textContent = optionEl.textContent;
        optionsContainer.querySelectorAll('.nerv-option').forEach(opt => opt.classList.remove('selected'));
        optionEl.classList.add('selected');
        customDropdown.classList.remove('active');
    });

    // Buka/tutup dropdown
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        customDropdown.classList.toggle('active');
    });

    // Tutup jika klik di luar
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
    
    // Reset
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
        // 1. Isi select asli
        const option = document.createElement('option');
        option.value = key;
        option.textContent = moduleLabels[key] || key;
        nativeSelect.appendChild(option);
        
        // 2. Isi custom dropdown UI
        const customOption = document.createElement('div');
        customOption.className = 'nerv-option';
        customOption.dataset.value = key;
        customOption.textContent = moduleLabels[key] || key;
        customOptionsContainer.appendChild(customOption);
    });
}

function downloadArduinoCode() {
    // PERBAIKAN: Ambil value dari select asli yang sudah di-update oleh custom dropdown
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
            statusEl.textContent = `✅ Berhasil! File ZIP (v${activeTemplateSource}.x) telah diunduh.`;
            setTimeout(() => { statusEl.style.display = 'none'; }, 3000);
        }
    } catch (error) {
        console.error("Gagal membuat ZIP:", error);
        if (statusEl) {
            statusEl.textContent = '❌ Gagal membuat file ZIP.';
            statusEl.style.color = 'var(--danger, red)';
        }
    }
}

// ==========================================
// 9. LOGOUT & INISIALISASI (DIPANGGIL 1X SAJA)
// ==========================================
function logout() {
    localStorage.removeItem('iot_db_url');
    localStorage.removeItem('iot_db_secret');
    localStorage.removeItem('iot_user_id');
    if (pollingInterval) clearInterval(pollingInterval);
    window.location.href = 'login.html';
}

document.getElementById('logoutBtn')?.addEventListener('click', logout);

// --- EKSEKUSI AWAL (Hanya 1 kali di sini) ---
console.log("Dashboard diinisialisasi untuk pengguna:", userId);

initCustomDropdown();
populateModuleDropdown();
switchVersion('v3'); // Default ke v3.x
fetchAndRenderDashboard();
pollingInterval = setInterval(fetchAndRenderDashboard, 3000);
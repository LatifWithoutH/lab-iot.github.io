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
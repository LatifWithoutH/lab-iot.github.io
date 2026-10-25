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

// Map global untuk menyimpan instance widget aktif
window.activeWidgets = new Map();

// ==========================================
// 2. HELPER: CEK VISIBILITAS & DETEKSI WIDGET
// ==========================================
function isWidgetVisible(key) {
    const savedSettings = JSON.parse(localStorage.getItem('iot_widget_visibility')) || {};
    return savedSettings.hasOwnProperty(key) ? savedSettings[key] : true;
}

// Helper deteksi tipe widget berdasarkan NAMA KEY (Convention over Configuration)
function getWidgetTypeByKey(key) {
    if (key.startsWith('switch')) return 'switch';
    if (key.startsWith('display')) return 'display';
    if (key.startsWith('gauge')) return 'gauge';
    if (key.startsWith('hlevel') || key.includes('jarak') || key.includes('ketinggian')) return 'hlevel';
    if (key.startsWith('indicator')) return 'indicator';
    if (key === 'joystick' || key.startsWith('joy')) return 'joystick';
    
    // Fallback untuk data custom/eksperimental
    return 'unknown'; 
}

// ==========================================
// 3. FUNGSI KIRIM DATA (FIREBASE) - DENGAN PROTEKSI NULL
// ==========================================
/**
 * PERINGATAN KERAS:
 * JANGAN PERNAH mengirim value NULL via sendData() ke Firebase!
 * Firebase Realtime Database akan MENGHAPUS key tersebut secara permanen.
 */
function sendData(key, value) {
    if (value === null || value === undefined) {
        console.error("❌ Ditolak: Mengirim null/undefined ke Firebase akan menghapus data!");
        return;
    }

    const cleanUrl = dbUrl.replace(/\/+$/, "");
    const url = `${cleanUrl}/${userId}/${key}.json?auth=${dbSecret}`;
    
    fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value)
    }).catch(err => console.error("Error mengirim data:", err));
}

// Helper untuk lazy loading script widget
async function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// ==========================================
// 4. REGISTRY WIDGET MODULAR (SELF-REGISTERING FACTORY)
// ==========================================
const WIDGET_REGISTRY = {
    'gauge':     { 
        class: 'GaugeWidget',     
        file: 'widget/gauge.js',     
        loaded: false,
        factory: (key, id) => new window.GaugeWidget(key, id) 
    },
    'hlevel':    { 
        class: 'HLevelWidget',    
        file: 'widget/hlevel.js',    
        loaded: false,
        factory: (key, id) => new window.HLevelWidget(key, id) 
    },
    'switch':    { 
        class: 'SwitchWidget',    
        file: 'widget/switch.js',    
        loaded: false,
        factory: (key, id) => new window.SwitchWidget(key, id) 
    },
    'indicator': { 
        class: 'IndicatorWidget', 
        file: 'widget/indicator.js', 
        loaded: false,
        factory: (key, id) => new window.IndicatorWidget(key, id) 
    },
    'display':   { 
        class: 'DisplayWidget',   
        file: 'widget/display.js',   
        loaded: false,
        factory: (key, id) => new window.DisplayWidget(key, id, sendData) 
    },
    'joystick': { 
        class: 'JoystickWidget',   
        file: 'widget/joystick.js',   
        loaded: false,
        factory: (key, id) => new window.JoystickWidget(key, id, sendData) 
    }
};

// ==========================================
// 5. RENDER DASHBOARD DINAMIS (DENGAN NULL PROTECTION)
// ==========================================
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

        for (const [key, value] of Object.entries(data)) {
            // SKIP KEY YANG BERVALUE NULL
            if (value === null) {
                console.warn(`⚠️ Key '${key}' bernilai null. Melewati render.`);
                continue; 
            }

            if (!isWidgetVisible(key)) {
                const existingWidget = document.getElementById(`widget-${key}`);
                if (existingWidget) {
                    existingWidget.remove();
                    const inst = window.activeWidgets.get(key);
                    if (inst && typeof inst.destroy === 'function') inst.destroy();
                    window.activeWidgets.delete(key);
                }
                continue; 
            }
        
            const widgetType = getWidgetTypeByKey(key);
            const reg = WIDGET_REGISTRY[widgetType];
            
            // Lazy Load: Muat script widget hanya jika belum dimuat
            if (reg && !reg.loaded) {
                try {
                    await loadScript(reg.file);
                    reg.loaded = true;
                    console.log(`✅ Widget '${widgetType}' berhasil dimuat.`);
                } catch (err) {
                    console.error(`❌ Gagal memuat widget '${widgetType}':`, err);
                    continue;
                }
            }

            let widgetEl = document.getElementById(`widget-${key}`);
            
            // Inisialisasi widget baru JIKA BELUM ADA
            if (!widgetEl && reg && reg.factory && window[reg.class]) {
                widgetEl = document.createElement('div');
                widgetEl.id = `widget-${key}`;
                widgetEl.className = 'widget dynamic-widget';
                container.appendChild(widgetEl);
                
                // Gunakan Factory Pattern
                const instance = reg.factory(key, `widget-${key}`);
                window.activeWidgets.set(key, instance);
            }

            // Update nilai via method .update()
            if (widgetEl && window.activeWidgets.has(key)) {
                window.activeWidgets.get(key).update(value);
            }
        }
    } catch (error) {
        console.error("Gagal mengambil data:", error);
    }
}

// ==========================================
// 6. LOGOUT & INISIALISASI
// ==========================================
function logout() {
    localStorage.removeItem('iot_db_url');
    localStorage.removeItem('iot_db_secret');
    localStorage.removeItem('iot_user_id');
    if (pollingInterval) clearInterval(pollingInterval);
    window.location.href = 'login.html';
}

document.getElementById('logoutBtn')?.addEventListener('click', logout);

// --- EKSEKUSI AWAL ---
console.log("Dashboard Modular diinisialisasi untuk pengguna:", userId);

fetchAndRenderDashboard();
pollingInterval = setInterval(fetchAndRenderDashboard, 3000);

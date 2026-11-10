// ==========================================
// 1. SATPAM (GUARD): CEK LOGIN & KONFIGURASI
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

// Map global untuk menyimpan instance widget aktif (Mencegah duplikasi & memudahkan update)
window.activeWidgets = new Map();

// Variabel global untuk koneksi streaming
window.firebaseEventSource = null;

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
// 3. FUNGSI KIRIM DATA (FIREBASE REST API)
// ==========================================
/**
 * PERINGATAN: JANGAN PERNAH mengirim value NULL via sendData() ke Firebase!
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
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        console.log(`✅ Data ${key} berhasil dikirim:`, value);
    })
    .catch(err => console.error(`❌ Error mengirim data ${key}:`, err));
}

// Helper untuk lazy loading script widget
async function loadScript(src) {
    return new Promise((resolve, reject) => {
        // Cek apakah script sudah ada di DOM
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Gagal memuat script: ${src}`));
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
        // PERBAIKAN: Inject sendData ke SwitchWidget
        factory: (key, id) => new window.SwitchWidget(key, id, sendData) 
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
    'joystick':  { 
        class: 'JoystickWidget',   
        file: 'widget/joystick.js',   
        loaded: false,
        // PERBAIKAN: Inject sendData ke JoystickWidget
        factory: (key, id) => new window.JoystickWidget(key, id, sendData) 
    }
};

// ==========================================
// 5. RENDER DASHBOARD DINAMIS
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

        for (const [key, value] of Object.entries(data)) {
            // SKIP KEY YANG BERVALUE NULL (Mencegah error render)
            if (value === null) {
                console.warn(`⚠️ Key '${key}' bernilai null. Melewati render.`);
                continue; 
            }

            // Cek visibilitas
            if (!isWidgetVisible(key)) {
                const existingWidget = document.getElementById(`widget-${key}`);
                if (existingWidget) {
                    existingWidget.remove();
                    const inst = window.activeWidgets.get(key);
                    if (inst && typeof inst.destroy === 'function') {
                        inst.destroy(); // Bersihkan event listener/memory
                    }
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
            
            // Inisialisasi widget baru JIKA BELUM ADA di DOM
            if (!widgetEl && reg && reg.factory && window[reg.class]) {
                widgetEl = document.createElement('div');
                widgetEl.id = `widget-${key}`;
                widgetEl.className = 'widget dynamic-widget';
                container.appendChild(widgetEl);
                
                // Gunakan Factory Pattern untuk membuat instance
                const instance = reg.factory(key, `widget-${key}`);
                window.activeWidgets.set(key, instance);
            }

            // Update nilai via method .update() pada instance yang sudah ada
            if (widgetEl && window.activeWidgets.has(key)) {
                window.activeWidgets.get(key).update(value);
            }
        }
    } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
    }
}

// ==========================================
// 6. LOGOUT (Diperbarui untuk menghentikan interval)
// ==========================================
let updateInterval = null; // Variabel global untuk menyimpan timer

function logout() {
    // HENTIKAN polling agar tidak terus berjalan di background setelah logout
    if (updateInterval) {
        clearInterval(updateInterval);
        console.log("⏹️ Realtime update dihentikan.");
    }
    
    localStorage.removeItem('iot_db_url');
    localStorage.removeItem('iot_db_secret');
    localStorage.removeItem('iot_user_id');
    localStorage.removeItem('iot_widget_visibility');
    
    window.location.href = 'login.html';
}

document.getElementById('logoutBtn')?.addEventListener('click', logout);

// ==========================================
// 7. EKSEKUSI AWAL & REAL-TIME UPDATES (SMART POLLING)
// ==========================================
console.log("🚀 Dashboard Modular diinisialisasi untuk pengguna:", userId);

function startRealtimeUpdates() {
    console.log("🚀 Memulai sinkronisasi realtime dengan Firebase (Smart Polling 1 detik)...");
    
    // 1. Ambil data pertama kali saat halaman dimuat
    fetchAndRenderDashboard();

    // 2. Setup interval untuk mengambil data setiap 1000ms (1 detik)
    // 1 detik adalah sweet spot: cukup cepat untuk IoT, tidak membebani Firebase
    updateInterval = setInterval(() => {
        fetchAndRenderDashboard();
    }, 1000); 
}

// Jalankan saat seluruh elemen HTML sudah siap
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startRealtimeUpdates);
} else {
    // Jika DOM sudah siap (misal script ditaruh di paling bawah body)
    startRealtimeUpdates();
}

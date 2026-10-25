// ==========================================
// 1. INISIALISASI & CEK LOGIN
// ==========================================
const dbUrl = localStorage.getItem('iot_db_url');
const dbSecret = localStorage.getItem('iot_db_secret');
const userId = localStorage.getItem('iot_user_id');

if (!dbUrl || !dbSecret || !userId) {
    window.location.href = 'login.html';
}

const container = document.getElementById('dynamic-settings-container');
const backBtn = document.getElementById('backBtn');
const saveBtn = document.getElementById('saveBtn');
const STORAGE_KEY = 'iot_widget_visibility';

// ==========================================
// 2. HELPER: DETEKSI TIPE WIDGET BERDASARKAN NAMA KEY
// ==========================================
function getHumanLabel(key) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// PENTING: Gunakan logika deteksi berbasis NAMA KEY, bukan tipe data!
// Ini harus sinkron dengan fungsi getWidgetTypeByKey() di dashboard.js
function getWidgetTypeByKey(key) {
    if (key.startsWith('switch')) return 'switch';
    if (key.startsWith('display')) return 'display';
    if (key.startsWith('gauge')) return 'gauge';
    if (key.startsWith('hlevel') || key.includes('jarak') || key.includes('ketinggian')) return 'hlevel';
    if (key.startsWith('indicator')) return 'indicator';
    
    // FALLBACK BARU: Kembalikan 'additional' untuk data custom/eksperimental
    // Jangan kembalikan 'indicator' agar data custom punya grup sendiri
    return 'additional'; 
}

// ==========================================
// 3. FUNGSI UTAMA: AMBIL DATA & RENDER DINAMIS
// ==========================================
async function loadDynamicSettings() {
    try {
        const cleanUrl = dbUrl.replace(/\/+$/, "");
        const url = `${cleanUrl}/${userId}.json?auth=${dbSecret}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error("Gagal terhubung ke Firebase");
        
        const data = await response.json();
        if (!data) {
            container.innerHTML = '<p class="empty-state">Belum ada data widget. Upload kode Arduino terlebih dahulu.</p>';
            return;
        }

        // Grup dinamis - tambahkan 'additional' untuk menampung data custom
        const groups = { 
            gauge: [], 
            hlevel: [], 
            indicator: [], 
            switch: [], 
            display: [],
            additional: [] 
        };
        
        // Loop data dan masukkan ke grup berdasarkan NAMA KEY
        for (const key of Object.keys(data)) {
            const type = getWidgetTypeByKey(key);
            if (groups[type]) {
                groups[type].push(key);
            } else {
                // Safety net: jika ada bug deteksi, lempar ke additional
                groups['additional'].push(key);
            }
        }

        container.innerHTML = ''; 
        
        // Urutan tampilan: Widget standar dulu, Additional di paling bawah
        const order = ['gauge', 'hlevel', 'indicator', 'switch', 'display', 'additional'];
        
        // Judul grup yang user-friendly
        const titles = { 
            gauge: 'Gauge (Data Angka)', 
            hlevel: 'Horizontal Level', 
            indicator: 'Indikator (Teks dari Alat)', 
            switch: 'Sakelar (Kontrol)', 
            display: 'Display (Kirim Teks ke Alat)',
            additional: 'Additional / Custom Data' 
        };

        // Render hanya grup yang memiliki item
        order.forEach(type => {
            if (groups[type] && groups[type].length > 0) {
                const groupHtml = createGroupHtml(type, titles[type], groups[type]);
                container.insertAdjacentHTML('beforeend', groupHtml);
            }
        });

        applySavedPreferences();

    } catch (error) {
        container.innerHTML = `<p class="error-state">Error: ${error.message}</p>`;
        console.error("Settings Load Error:", error);
    }
}

// ==========================================
// 4. PEMBUAT HTML GRUP (Dengan Styling Khusus Additional)
// ==========================================
function createGroupHtml(type, title, keys) {
    // Tambahkan class khusus jika ini grup additional
    const groupClass = type === 'additional' ? 'widget-group additional-group' : 'widget-group';
    
    let itemsHtml = keys.map(key => {
        const label = getHumanLabel(key);
        return `
        <label class="checkbox-label">
            <input type="checkbox" data-widget="${key}" class="widget-checkbox">
            <span>${label}</span>
            <small class="key-hint">(${key})</small>
        </label>`;
    }).join('');

    return `
    <div class="${groupClass}">
        <h3>${title}</h3>
        <div class="widget-grid">
            ${itemsHtml}
        </div>
    </div>`;
}

function applySavedPreferences() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    document.querySelectorAll('.widget-checkbox').forEach(cb => {
        const key = cb.getAttribute('data-widget');
        // Default true jika belum pernah disetting
        cb.checked = saved.hasOwnProperty(key) ? saved[key] : true; 
    });
}

// ==========================================
// 5. EVENT LISTENERS
// ==========================================
saveBtn.addEventListener('click', () => {
    const settings = {};
    document.querySelectorAll('.widget-checkbox').forEach(cb => {
        settings[cb.getAttribute('data-widget')] = cb.checked;
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Tersimpan! ✓';
    saveBtn.style.background = 'var(--eva-green)';
    saveBtn.style.color = 'var(--nerv-black)';
    
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 800);
});

backBtn.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
});

// Jalankan saat halaman dimuat
loadDynamicSettings();

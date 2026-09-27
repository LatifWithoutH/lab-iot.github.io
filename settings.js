// ==========================================
// 1. INISIALISASI & CEK LOGIN
// ==========================================
const dbUrl = localStorage.getItem('iot_db_url');
const dbSecret = localStorage.getItem('iot_db_secret');
const userId = localStorage.getItem('iot_user_id');

if (!dbUrl || !dbSecret || !userId) {
    window.location.href = 'index.html'; // Atau 'login.html' jika belum di-rename
}

const container = document.getElementById('dynamic-settings-container');
const backBtn = document.getElementById('backBtn');
const saveBtn = document.getElementById('saveBtn');
const STORAGE_KEY = 'iot_widget_visibility';
// ==========================================
// 2. HELPER: FORMAT LABEL MURNI DINAMIS (TANPA MAPPING)
// ==========================================
function getHumanLabel(key) {
    // Murni format string: ganti underscore dengan spasi, lalu kapitalisasi huruf pertama setiap kata
    // Contoh: "suhu_kamar" -> "Suhu Kamar"
    // Contoh: "gauge1" -> "Gauge1"
    // Contoh: "sensor_cahaya_baru" -> "Sensor Cahaya Baru"
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getWidgetType(key, value) {
    if (typeof value === 'boolean') return 'switch';
    if (typeof value === 'string') return 'indicator';
    if (typeof value === 'number') {
        return key.toLowerCase().includes('hlevel') ? 'hlevel' : 'gauge';
    }
    return 'unknown';
}
// ==========================================
// 3. FUNGSI UTAMA: AMBIL DATA DARI FIREBASE & RENDER
// ==========================================
async function loadDynamicSettings() {
    try {
        const cleanUrl = dbUrl.replace(/\/+$/, "");
        const url = `${cleanUrl}/${userId}.json?auth=${dbSecret}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error("Gagal terhubung ke Firebase");
        
        const data = await response.json();
        if (!data) {
            container.innerHTML = '<p class="empty-state">Belum ada data widget untuk user ini.</p>';
            return;
        }

        // Kelompokkan widget berdasarkan tipe
        const groups = { gauge: [], hlevel: [], indicator: [], switch: [] };
        
        for (const [key, value] of Object.entries(data)) {
            const type = getWidgetType(key, value);
            if (groups[type]) {
                groups[type].push(key);
            }
        }

        // Render HTML (Hapus loading state)
        container.innerHTML = ''; 
        
        // Urutan render kelompok
        const order = ['gauge', 'hlevel', 'indicator', 'switch'];
        const titles = { 
            gauge: 'Gauge (Data Angka)', 
            hlevel: 'Horizontal Level', 
            indicator: 'Indikator (Teks)', 
            switch: 'Sakelar (Kontrol)' 
        };

        order.forEach(type => {
            if (groups[type].length > 0) {
                const groupHtml = createGroupHtml(type, titles[type], groups[type]);
                container.insertAdjacentHTML('beforeend', groupHtml);
            }
        });

        // Terapkan preferensi visibilitas yang sudah tersimpan sebelumnya
        applySavedPreferences();

    } catch (error) {
        container.innerHTML = `<p class="error-state">Error: ${error.message}</p>`;
    }
}

// ==========================================
// 4. PEMBUAT HTML (TANPA KURUNG KECIL)
// ==========================================
function createGroupHtml(type, title, keys) {
    let itemsHtml = keys.map(key => {
        const label = getHumanLabel(key);
        return `
        <label class="checkbox-label">
            <input type="checkbox" data-widget="${key}" class="widget-checkbox">
            <span>${label}</span>
        </label>`;
    }).join('');

    return `
    <div class="widget-group">
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
        // Default: tampilkan (checked = true) jika belum pernah diatur
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
    
    // Simpan ke LocalStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    
    // Feedback visual
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Tersimpan!';
    
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 800);
});

backBtn.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
});

// Jalankan saat halaman dimuat
loadDynamicSettings();
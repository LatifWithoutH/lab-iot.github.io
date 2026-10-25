// widget/display.js

/**
 * DisplayWidget: Widget input teks dua arah (Read & Write).
 * Menerima pesan dari Firebase & mengirim input user balik ke alat.
 * Extends BaseWidget untuk keamanan dan utilitas dasar.
 */
class DisplayWidget extends BaseWidget {
    /**
     * @param {string} key - Nama key Firebase (misal: 'display1')
     * @param {string} containerId - ID elemen container HTML
     * @param {function} sendDataCallback - Fungsi untuk kirim data ke Firebase (Dependency Injection)
     */
    constructor(key, containerId, sendDataCallback) {
        super(key, containerId);
        
        // Simpan callback kirim data. Jika tidak ada, pakai fungsi kosong agar tidak error
        this.sendData = sendDataCallback || (() => {}); 
        this.debounceTimer = null;
        
        this.render();
        this.bindEvents(); // Bind event listener setelah DOM siap
    }

    render() {
        // Struktur DOM disesuaikan PERSIS dengan createDisplayWidget versi jadul
        const wrapper = document.createElement('div');
        wrapper.className = 'widget display-widget';
        
        // Header dengan Status Indicator
        const header = document.createElement('div');
        header.className = 'widget-header';
        
        const title = document.createElement('span');
        title.className = 'widget-title';
        title.textContent = this.getHumanLabel();
        
        const status = document.createElement('span');
        status.className = 'display-status';
        status.id = `status-${this.key}`;
        
        header.appendChild(title);
        header.appendChild(status);

        // Input Container
        const content = document.createElement('div');
        content.className = 'display-content';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'display-input';
        input.id = `input-${this.key}`;
        input.placeholder = "Ketik pesan...";
        input.dataset.key = this.key; // Simpan key di dataset untuk referensi
        input.autocomplete = "off";
        
        content.appendChild(input);
        wrapper.appendChild(header);
        wrapper.appendChild(content);

        this.container.appendChild(wrapper);
    }

    bindEvents() {
        const input = document.getElementById(`input-${this.key}`);
        if (!input) return;

        // Event INPUT: Debounce agar tidak spam Firebase saat mengetik cepat
        input.addEventListener('input', (e) => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.sendData(this.key, e.target.value);
                this.showSendStatus('sent');
            }, 800); // Delay 800ms sesuai kode jadul
        });

        // Event KEYPRESS: Enter langsung kirim tanpa delay
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                clearTimeout(this.debounceTimer); // Batalkan debounce kalau user tekan Enter
                this.sendData(this.key, e.target.value);
                this.showSendStatus('sent');
                input.blur(); // Hilangkan fokus setelah kirim
            }
        });
    }

    update(value) {
        // VALIDASI KETAT: Display hanya terima string
        if (typeof value !== 'string') return; 
        
        const input = document.getElementById(`input-${this.key}`);
        
        // PENTING: Jangan update nilai kalau user sedang mengetik (fokus aktif)
        // Ini mencegah kursor lompat ke awal saat ada update polling dari Firebase
        if (input && document.activeElement !== input) {
            input.value = value;
        }
    }

    showSendStatus(status) {
        const statusEl = document.getElementById(`status-${this.key}`);
        if (!statusEl) return;
        
        if (status === 'sent') {
            statusEl.textContent = '✓';
            statusEl.style.color = '#28a745'; // Hijau sukses
            
            // Hapus status setelah 1.5 detik
            setTimeout(() => { 
                statusEl.textContent = ''; 
            }, 1500);
        }
    }

    destroy() {
        // Bersihkan timer debounce saat widget dihapus untuk cegah memory leak
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
    }
}

// WAJIB: Daftarkan ke Global Scope agar bisa diakses Dashboard
window.DisplayWidget = DisplayWidget;

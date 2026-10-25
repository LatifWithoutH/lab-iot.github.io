// widget/indicator.js

/**
 * IndicatorWidget: Widget teks statis untuk menampilkan status atau label.
 * Bersifat Read-Only (Hanya menerima data dari Firebase).
 * Extends BaseWidget untuk keamanan dan utilitas dasar.
 */
class IndicatorWidget extends BaseWidget {
    constructor(key, containerId) {
        super(key, containerId);
        this.render();
    }

    render() {
        // Struktur DOM disesuaikan PERSIS dengan createIndicatorWidget versi jadul
        const wrapper = document.createElement('div');
        wrapper.className = 'widget indicator-widget';
        
        // Header Widget
        const header = document.createElement('div');
        header.className = 'widget-header';
        
        const title = document.createElement('span');
        title.className = 'widget-title';
        title.textContent = this.getHumanLabel();
        
        header.appendChild(title);

        // Konten Indikator (Area Teks Utama)
        const content = document.createElement('div');
        content.className = 'indicator-content';
        
        const textSpan = document.createElement('span');
        textSpan.className = 'indicator-text';
        textSpan.id = `text-${this.key}`;
        textSpan.textContent = '--'; // Nilai default saat inisialisasi
        
        content.appendChild(textSpan);
        wrapper.appendChild(header);
        wrapper.appendChild(content);

        this.container.appendChild(wrapper);
    }

    update(value) {
        // VALIDASI & SANITASI KETAT
        // Jika value adalah object/array (data sampah/error), tampilkan pesan aman
        if (typeof value === 'object') {
            value = '[Data Invalid]';
        } else if (value === null || value === undefined) {
            value = '--';
        }

        const textEl = document.getElementById(`text-${this.key}`);
        if (textEl) {
            // Gunakan safeText() dari BaseWidget untuk memastikan XSS aman
            // dan konversi tipe data primitif (number/boolean) ke string dengan rapi
            textEl.textContent = this.safeText(value);
        }
    }
}

// WAJIB: Daftarkan ke Global Scope agar bisa diakses Dashboard
window.IndicatorWidget = IndicatorWidget;

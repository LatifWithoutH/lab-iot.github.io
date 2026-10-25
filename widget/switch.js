// widget/switch.js

/**
 * SwitchWidget: Widget sakelar/toggle untuk kontrol perangkat.
 * Bersifat Interaktif (Mengirim data balik ke Firebase saat diklik).
 * Extends BaseWidget untuk keamanan dan utilitas dasar.
 */
class SwitchWidget extends BaseWidget {
    /**
     * @param {string} key - Nama key Firebase (misal: 'switch1')
     * @param {string} containerId - ID elemen container HTML
     * @param {function} sendDataCallback - Fungsi untuk kirim data ke Firebase (Dependency Injection)
     */
    constructor(key, containerId, sendDataCallback) {
        super(key, containerId);
        
        // Simpan callback kirim data. Jika tidak ada, pakai fungsi kosong agar tidak error
        this.sendData = sendDataCallback || (() => {}); 
        this.render();
        this.bindEvents(); // Bind event listener setelah DOM siap
    }

    render() {
        // Struktur DOM disesuaikan PERSIS dengan createSwitchWidget versi jadul
        const wrapper = document.createElement('div');
        wrapper.className = 'widget switch-widget';
        
        // Header Widget
        const header = document.createElement('div');
        header.className = 'widget-header';
        
        const title = document.createElement('span');
        title.className = 'widget-title';
        title.textContent = this.getHumanLabel();
        
        header.appendChild(title);

        // Container Sakelar
        const switchContainer = document.createElement('div');
        switchContainer.className = 'switch-container';
        
        const label = document.createElement('label');
        label.className = 'switch';
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `toggle-${this.key}`;
        // Kondisi awal unchecked
        
        const slider = document.createElement('span');
        slider.className = 'slider';
        
        label.appendChild(input);
        label.appendChild(slider);
        switchContainer.appendChild(label);
        
        wrapper.appendChild(header);
        wrapper.appendChild(switchContainer);

        this.container.appendChild(wrapper);
    }

    bindEvents() {
        const toggle = document.getElementById(`toggle-${this.key}`);
        if (!toggle) return;

        // Event CHANGE: Terpicu saat user mengklik toggle
        toggle.addEventListener('change', (e) => {
            // Kirim status baru (true/false) ke Firebase via callback
            this.sendData(this.key, e.target.checked);
        });
    }

    update(value) {
        // VALIDASI KETAT: Switch hanya terima boolean atau string "true"/"false"
        let isChecked = false;
        
        if (typeof value === 'boolean') {
            isChecked = value;
        } else if (typeof value === 'string') {
            isChecked = (value.toLowerCase() === 'true');
        }

        const toggle = document.getElementById(`toggle-${this.key}`);
        
        // Update posisi toggle HANYA JIKA berbeda dengan state saat ini
        // Ini mencegah flickering atau reset posisi saat polling
        if (toggle && toggle.checked !== isChecked) {
            toggle.checked = isChecked;
        }
    }
}

// WAJIB: Daftarkan ke Global Scope agar bisa diakses Dashboard
window.SwitchWidget = SwitchWidget;

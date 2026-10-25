// widget/hlevel.js (Revisi Sinkron dengan Kode Jadul)

class HLevelWidget extends BaseWidget {
    constructor(key, containerId) {
        super(key, containerId);
        this.render();
    }

    render() {
        // Struktur DOM disesuaikan PERSIS dengan createHLevelWidget versi jadul
        const wrapper = document.createElement('div');
        wrapper.className = 'widget hlevel-widget';
        
        // Header
        const header = document.createElement('div');
        header.className = 'widget-header';
        
        const title = document.createElement('span');
        title.className = 'widget-title';
        title.textContent = this.getHumanLabel();
        
        const valSpan = document.createElement('span');
        valSpan.className = 'widget-value';
        valSpan.id = `val-${this.key}`;
        valSpan.textContent = '0';
        
        header.appendChild(title);
        header.appendChild(valSpan);

        // Bar Horizontal (Persis versi jadul)
        const bar = document.createElement('div');
        bar.className = 'hlevel-bar';
        
        const fill = document.createElement('div');
        fill.className = 'hlevel-fill';
        fill.id = `fill-${this.key}`;
        fill.style.width = '0%'; 
        
        bar.appendChild(fill);

        // Label Bawah (Persis versi jadul: 3 span)
        const label = document.createElement('div');
        label.className = 'hlevel-label';
        label.innerHTML = `
            <span>0</span>
            <span id="lbl-${this.key}">0</span>
            <span>Maks</span>
        `;

        wrapper.appendChild(header);
        wrapper.appendChild(bar);
        wrapper.appendChild(label);

        this.container.appendChild(wrapper);
    }

    update(value) {
        // Validasi ketat angka
        const num = typeof value === 'number' && !isNaN(value) ? value : 0;
        const pct = Math.min((num / 200) * 100, 100); // Skala maks 200 sesuai modul ultrasonik
        
        // Update lebar bar
        const fill = document.getElementById(`fill-${this.key}`);
        if (fill) fill.style.width = `${pct}%`;
        
        // Update angka di header DAN label tengah (span ke-2)
        const val = document.getElementById(`val-${this.key}`);
        const lbl = document.getElementById(`lbl-${this.key}`);
        
        if (val) val.textContent = this.safeText(num);
        if (lbl) lbl.textContent = this.safeText(num); 
    }
}

// Wajib daftarkan ke global scope
window.HLevelWidget = HLevelWidget;

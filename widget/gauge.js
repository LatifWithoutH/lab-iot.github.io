// widget/gauge.js

/**
 * GaugeWidget: Widget visualisasi data angka berbentuk lingkaran (0-100).
 * Extends BaseWidget untuk mendapatkan fitur keamanan dan utilitas dasar.
 */
class GaugeWidget extends BaseWidget {
    constructor(key, containerId) {
        super(key, containerId);
        this.render();
    }

    render() {
        // Membuat struktur DOM secara manual (Anti-XSS & Performa)
        const wrapper = document.createElement('div');
        wrapper.className = 'widget gauge-widget';
        
        // Header Widget
        const header = document.createElement('div');
        header.className = 'widget-header';
        
        const title = document.createElement('span');
        title.className = 'widget-title';
        title.textContent = this.getHumanLabel(); // Aman karena textContent
        
        const valSpan = document.createElement('span');
        valSpan.className = 'widget-value';
        valSpan.id = `val-${this.key}`;
        valSpan.textContent = '0';
        
        header.appendChild(title);
        header.appendChild(valSpan);

        // Area Gauge SVG
        const gaugeContainer = document.createElement('div');
        gaugeContainer.className = 'gauge-container';
        
        const gaugeCircle = document.createElement('div');
        gaugeCircle.className = 'gauge-circle';
        
        // SVG relatif statis, innerHTML aman karena datanya murni kalkulasi internal
        gaugeCircle.innerHTML = `
            <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" class="gauge-bg"/>
                <circle cx="50" cy="50" r="45" class="gauge-fill" id="fill-${this.key}"/>
            </svg>
            <div class="gauge-text">
                <span id="txt-${this.key}">0</span>
                <small>unit</small>
            </div>
        `;

        gaugeContainer.appendChild(gaugeCircle);
        wrapper.appendChild(header);
        wrapper.appendChild(gaugeContainer);

        // Inject ke container utama
        this.container.appendChild(wrapper);
    }

    update(value) {
        // VALIDASI KETAT: Gauge hanya menerima angka
        const num = typeof value === 'number' && !isNaN(value) ? value : 0;
        
        // Kalkulasi persentase dan offset SVG
        const pct = Math.min((num / 100) * 100, 100);
        const offset = 283 - (283 * pct / 100);
        
        // Update DOM Elements
        const fill = document.getElementById(`fill-${this.key}`);
        const txt = document.getElementById(`txt-${this.key}`);
        const val = document.getElementById(`val-${this.key}`);
        
        if (fill) fill.style.strokeDashoffset = offset;
        if (txt) txt.textContent = this.safeText(num); // Gunakan safeText
        if (val) val.textContent = this.safeText(num);
    }
}

window.GaugeWidget = GaugeWidget;

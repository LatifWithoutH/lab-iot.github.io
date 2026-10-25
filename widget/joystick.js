// widget/joystick.js

/**
 * JoystickWidget: Widget kontrol arah universal berbasis IoT.
 * Mengirim perintah arah (UP/DOWN/LEFT/RIGHT) ke perangkat.
 * Extends BaseWidget untuk keamanan dan utilitas dasar.
 */
class JoystickWidget extends BaseWidget {
    constructor(key, containerId, sendDataCallback) {
        super(key, containerId);
        this.sendData = sendDataCallback || (() => {});
        this.currentState = "ACTIVE"; // State lokal tetap ada untuk validasi input
        
        // Injeksi CSS hanya sekali secara global agar tidak duplikat
        if (!document.getElementById('joystick-widget-style')) {
            const style = document.createElement('style');
            style.id = 'joystick-widget-style';
            style.textContent = `
                /* Container Utama Joystick - SERAGAM DENGAN WIDGET LAIN */
                .joystick-widget {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    background: rgba(0, 0, 0, 0.4);
                    border-radius: 12px;
                    border: 1px solid var(--nerv-border, #333);
                    width: 100%;
                    height: 100%;
                    box-sizing: border-box;
                    margin: 0;
                }

                /* Grid Layout D-Pad 3x3 */
                .joystick-grid {
                    display: grid;
                    grid-template-columns: 70px 70px 70px;
                    grid-template-rows: 70px 70px 70px;
                    gap: 8px;
                }

                /* Tombol Arah */
                .joystick-btn {
                    background: #1a1a1a;
                    border: 2px solid var(--eva-green, #00ff88);
                    color: var(--eva-green, #00ff88);
                    font-size: 1.8rem;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.1s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    user-select: none;
                    -webkit-tap-highlight-color: transparent;
                }

                .joystick-btn:active, 
                .joystick-btn.pressed {
                    background: var(--eva-green, #00ff88);
                    color: #000;
                    transform: scale(0.92);
                    box-shadow: 0 0 15px var(--eva-green, #00ff88);
                }

                .joystick-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                    border-color: #444;
                    color: #444;
                    background: #0f0f0f;
                }

                /* Posisi Tombol di Grid */
                .joystick-btn.btn-up    { grid-column: 2; grid-row: 1; }
                .joystick-btn.btn-left  { grid-column: 1; grid-row: 2; }
                .joystick-btn.btn-right { grid-column: 3; grid-row: 2; }
                .joystick-btn.btn-down  { grid-column: 2; grid-row: 3; }
            `;
            document.head.appendChild(style);
        }

        this.render();
        this.bindEvents();
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.className = 'widget joystick-widget';
        
        // Joystick Grid (D-Pad Layout) - LANGSUNG TANPA STATUS BAR
        const joystick = document.createElement('div');
        joystick.className = 'joystick-grid';
        
        // Placeholder kosong untuk layout grid 3x3
        const spacerTL = document.createElement('div'); 
        const spacerTR = document.createElement('div');
        const spacerBL = document.createElement('div');
        const spacerBR = document.createElement('div');
        
        const dirs = [
            { dir: 'UP', label: '▲', class: 'btn-up' },
            { dir: 'LEFT', label: '◀', class: 'btn-left' },
            { dir: 'RIGHT', label: '▶', class: 'btn-right' },
            { dir: 'DOWN', label: '▼', class: 'btn-down' }
        ];

        // Susun elemen sesuai posisi grid
        joystick.appendChild(spacerTL);
        joystick.appendChild(this._createBtn(dirs[0])); // UP
        joystick.appendChild(spacerTR);
        
        joystick.appendChild(this._createBtn(dirs[1])); // LEFT
        joystick.appendChild(document.createElement('div')); // Center (kosong)
        joystick.appendChild(this._createBtn(dirs[2])); // RIGHT
        
        joystick.appendChild(spacerBL);
        joystick.appendChild(this._createBtn(dirs[3])); // DOWN
        joystick.appendChild(spacerBR);

        wrapper.appendChild(joystick);
        this.container.appendChild(wrapper);
    }

    _createBtn(config) {
        const btn = document.createElement('button');
        btn.className = `joystick-btn ${config.class}`;
        btn.dataset.dir = config.dir;
        btn.textContent = config.label;
        return btn;
    }

    bindEvents() {
        const wrapper = this.container.querySelector('.joystick-widget');
        if (!wrapper) return;

        // Event delegation untuk tombol arah
        wrapper.addEventListener('click', (e) => {
            const btn = e.target.closest('.joystick-btn');
            if (btn && this.currentState === "ACTIVE") {
                this.sendDirection(btn.dataset.dir);
                
                // Efek visual tekan
                btn.classList.add('pressed');
                setTimeout(() => btn.classList.remove('pressed'), 150);
                
                // Haptic feedback jika didukung
                if (navigator.vibrate) navigator.vibrate(30);
            }
        });

        // Keyboard support (WASD / Arrow Keys)
        this._handleKeydown = (e) => {
            const keyMap = {
                'ArrowUp': 'UP', 'w': 'UP', 'W': 'UP',
                'ArrowDown': 'DOWN', 's': 'DOWN', 'S': 'DOWN',
                'ArrowLeft': 'LEFT', 'a': 'LEFT', 'A': 'LEFT',
                'ArrowRight': 'RIGHT', 'd': 'RIGHT', 'D': 'RIGHT'
            };
            
            const action = keyMap[e.key];
            if (action && this.currentState === "ACTIVE") {
                this.sendDirection(action);
                
                // Highlight tombol virtual
                const btn = wrapper.querySelector(`.joystick-btn[data-dir="${action}"]`);
                if (btn) {
                    btn.classList.add('pressed');
                    setTimeout(() => btn.classList.remove('pressed'), 150);
                }
            }
        };
        
        document.addEventListener('keydown', this._handleKeydown);
    }

    sendDirection(dir) {
        // Kirim hanya properti direction
        this.sendData(this.key, { direction: dir });
    }

    update(value) {
        // VALIDASI: Joystick hanya terima object
        if (typeof value !== 'object' || value === null) return;

        // Update State Lokal & UI Controls (Tanpa Text Label)
        if (value.gameState) {
            this.currentState = value.gameState;
            const dirBtns = this.container.querySelectorAll('.joystick-btn');
            const isActive = (value.gameState === "ACTIVE");
            
            // Disable/Enable controls berdasarkan state
            dirBtns.forEach(btn => btn.disabled = !isActive);
        }
    }

    destroy() {
        // Bersihkan event listener keyboard saat widget dihapus
        if (this._handleKeydown) {
            document.removeEventListener('keydown', this._handleKeydown);
        }
    }
}

// WAJIB: Daftarkan ke Global Scope
window.JoystickWidget = JoystickWidget;

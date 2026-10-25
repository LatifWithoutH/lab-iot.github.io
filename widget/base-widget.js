// widget/base-widget.js

/**
 * BaseWidget: Class induk untuk semua widget dashboard.
 * Menyediakan sanitasi data, formatting label, dan struktur DOM dasar.
 */
class BaseWidget {
    /**
     * @param {string} key - Nama key dari Firebase (misal: 'gauge1')
     * @param {string} containerId - ID elemen HTML tempat widget dirender
     */
    constructor(key, containerId) {
        this.key = key;
        this.container = document.getElementById(containerId);
        
        if (!this.container) {
            console.error(`[BaseWidget] Container #${containerId} tidak ditemukan!`);
            return;
        }
    }

    /**
     * Mengubah key Firebase menjadi label yang mudah dibaca manusia.
     * Contoh: 'gauge_suhu_ruang' -> 'Gauge Suhu Ruang'
     */
    getHumanLabel() {
        return this.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    /**
     * Sanitasi universal untuk mencegah XSS dan error tipe data.
     * Selalu gunakan method ini saat menampilkan nilai ke UI.
     * @param {*} value - Nilai mentah dari Firebase
     * @returns {string} String yang aman untuk ditampilkan
     */
    safeText(value) {
        if (value === null || value === undefined) return '--';
        if (typeof value === 'object') return '[Data Invalid]';
        return String(value);
    }

    /**
     * Method wajib yang harus di-override oleh child class.
     * Bertugas membuat struktur HTML/DOM widget saat pertama kali dimuat.
     */
    render() {
        throw new Error('Method render() harus diimplementasikan di child class');
    }

    /**
     * Method wajib yang harus di-override oleh child class.
     * Bertugas memperbarui tampilan widget saat ada data baru dari Firebase.
     * @param {*} value - Nilai terbaru dari Firebase
     */
    update(value) {
        throw new Error('Method update() harus diimplementasikan di child class');
    }

    /**
     * Method opsional untuk membersihkan event listener atau interval
     * saat widget disembunyikan/dihapus. Mencegah memory leak.
     */
    destroy() {
        // Override jika widget memiliki event listener khusus
    }
}

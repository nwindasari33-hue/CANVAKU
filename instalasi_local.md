# 🏠 Panduan Instalasi Lokal (Tanpa Vercel)

Jika Anda ingin menjalankan bot di server sendiri (VPS/RDP) atau PC lokal 24/7 tanpa menggunakan Vercel, ikuti panduan ini.

**Keunggulan Deploy Lokal:**
- **Respons Lebih Cepat**: Menggunakan metode Long Polling (bukan Webhook), bot merespon instan.
- **Kontrol Penuh**: Tidak kena limit serverless function (timeout 10s).
- **Automation Stabil**: Bisa invite langsung tanpa menunggu trigger GitHub Actions (opsional).

---

## 📋 Persiapan (Wajib)
1.  **Node.js LTS** (Versi 18+).
2.  **Git**.
3.  **Google Chrome** (Browser asli untuk Puppeteer).
4.  **Database URL** (Bisa pakai Turso online atau SQLite lokal).
5.  **PM2** (Process Manager agar bot jalan terus di background).
    - Install via terminal:
      ```bash
      npm install -g pm2
      ```

---

## 🛠️ Tahap 1: Setup & Config
1.  **Clone Repo**:
    ```bash
    git clone https://github.com/username/repo-anda.git
    cd repo-anda
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **File Environment (.env)**:
    Buat file `.env` dan isi:
    ```env
    BOT_TOKEN=123456:ABC-DEF...
    ADMIN_ID=123456789
    
    # Pilih Database (Salah Satu)
    # A. Pakai Turso (Disarankan agar data aman):
    TURSO_DATABASE_URL=libsql://...
    TURSO_AUTH_TOKEN=ey...
    
    # B. Pakai SQLite Lokal (File):
    # TURSO_DATABASE_URL=file:./local.db
    
    # Browser lokal untuk Puppeteer
    # Chrome lokal diprioritaskan. Jika Chrome tidak terdeteksi, isi CHROME_BIN.
    CHROME_BIN=C:\Program Files\Google\Chrome\Application\chrome.exe
    
    # Fallback: jika Chrome lokal ada di lokasi berbeda, ganti path di atas
    # CHROME_BIN=C:\Users\<USER>\AppData\Local\Google\Chrome\Application\chrome.exe
    ```

4.  **Setup Database**:
    Jika pakai Turso:
    ```bash
    npx turso db shell <URL> "auth <TOKEN>; .read migrations/schema.sql"
    ```
    Jika pakai SQLite Lokal (belum ada file):
    *Anda perlu menjalankan script migrasi manual atau pakai tool SQLite database browser untuk execute isi `migrations/schema.sql`.*

---

## 🚀 Tahap 2: Menjalankan Bot (Via PM2)

Kita gunakan **PM2** agar bot otomatis restart jika crash atau server reboot.

1.  **Start Bot Utama (Local Mode)**:
    Jalankan perintah ini di terminal folder project:
    ```bash
    npm run dev:local
    ```
    *(Bot akan polling Telegram langsung dan ikut menjalankan job invite/kick.)*

2.  **Start Queue Processor (Auto-Invite)**:
    Di local mode, script ini dijalankan otomatis oleh `dev:local`.
    Jika ingin tes manual terpisah, jalankan:
    ```bash
    npm run process-queue
    ```

3.  **Start Auto-Kick (User Expired)**:
    Di local mode, script ini dijalankan otomatis oleh `dev:local`.
    Jika ingin tes manual terpisah, jalankan:
    ```bash
    npm run auto-kick
    ```

4.  **Simpan Config PM2**:
    Agar jalan otomatis setelah restart PC/VPS:
    ```bash
    pm2 save
    pm2 startup
    ```

---

## 📊 Monitoring & Maintenance

- **Cek Status**:
  ```bash
  pm2 status
  ```
- **Lihat Log (Error/Info)**:
  ```bash
  pm2 logs bot-canva
  pm2 logs canva-queue
  ```
- **Stop Bot**:
  ```bash
  pm2 stop all
  ```
- **Update Bot (Setelah edit koding)**:
  ```bash
  git pull
  pm2 restart all
  ```

---

## 💡 Troubleshooting
- **Error: Chrome not found**:
  Pastikan Google Chrome terinstall. Jika masih error, set variable `CHROME_PATH` di `.env` ke lokasi file `chrome.exe` atau `google-chrome-stable`.
- **Bot tidak respon**: Cek `pm2 logs bot-canva`. Kemungkinan token salah atau koneksi internet putus.
- **Database Locked**: Jika pakai SQLite lokal (`file:./local.db`), pastikan tidak ada proses lain yang mengunci file db secara bersamaan. Turso lebih disarankan untuk multi-process (Bot + Queue).

Selamat! Bot Anda kini berjalan mandiri di server lokal. 🖥️🔥

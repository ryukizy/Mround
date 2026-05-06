# Morning Round 5R Checklist - Full Project

Aplikasi Progressive Web App (PWA) React + Firebase untuk **Morning Round 5R Checklist** di manufaktur.

## Fitur Lengkap

✅ Authentication (Email/Password) + Role Operator/Supervisor  
✅ Dashboard dengan statistik & progress circle  
✅ Form Checklist 5R (Ya/Tidak/N/A) + validasi  
✅ Upload Foto Sebelum & Sesudah (kamera langsung)  
✅ Tanda Tangan Digital Canvas  
✅ Simpan ke Firestore + Firebase Storage  
✅ Riwayat + Filter (Status, Area)  
✅ Detail Laporan + Export PDF (jsPDF)  
✅ PWA (installable di HP)  
✅ Offline support (Firestore persistence)  
✅ Toast notifications (sonner)  
✅ Mobile-first clean UI (hijau seperti mockup)

## Struktur Folder

```
morning-round-5r-checklist/
├── public/
├── src/
│   ├── components/
│   │   ├── BottomNav.jsx
│   │   ├── PhotoUpload.jsx
│   │   ├── ProgressCircle.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── SignaturePad.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── ChecklistFormPage.jsx
│   │   ├── HistoryPage.jsx
│   │   └── DetailReportPage.jsx
│   ├── services/
│   │   └── firebase.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js (sudah include PWA)
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Cara Setup Firebase (PENTING)

1. Buka https://console.firebase.google.com/
2. Buat Project baru
3. Enable **Authentication** → Email/Password
4. Enable **Firestore Database**
5. Enable **Storage**
6. Project Settings → General → Add Web App → Copy config
7. Paste ke `src/services/firebase.js` (ganti YOUR_API_KEY_HERE dll)

## Cara Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000

## Cara Deploy & Install di HP (PWA)

1. Build production:
   ```bash
   npm run build
   ```

2. Deploy ke Vercel / Netlify / Firebase Hosting (sangat mudah)

3. **Install di HP**:
   - **Android Chrome**: Buka website → Menu → Install App
   - **iOS Safari**: Share → Add to Home Screen

Setelah di-install, aplikasi berjalan offline-first dan terasa seperti app native.

## Bonus Fitur yang Sudah Ada

- Loading skeleton
- Toast notification yang cantik
- Offline persistence Firestore
- Service Worker caching otomatis
- Responsive (mobile-first)

## Catatan untuk Production

- Ganti Firebase config
- Tambahkan Firebase Security Rules yang aman
- Untuk role Supervisor lebih baik pakai Custom Claims (Firebase Admin SDK)
- Ukuran foto saat ini max 5MB

---

**Siap pakai untuk kebutuhan operasional pabrik!**

Jika butuh penambahan fitur (multi-area, approval supervisor, export Excel, dll), tinggal bilang.

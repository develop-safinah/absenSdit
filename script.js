import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDKp4-2xoQldMuh5PzwBDVCZKG82mS6CY",
  authDomain: "absensi-sdit-9a872.firebaseapp.com",
  projectId: "absensi-sdit-9a872",
  storageBucket: "absensi-sdit-9a872.firebasestorage.app",
  messagingSenderId: "196616421068",
  appId: "1:196616421068:web:0b64690ce5dbdcdd77cc69",
  measurementId: "G-D015K9FE6M"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Titik lokasi SDIT Safinatunnajah
const SEKOLAH_LAT = -6.1217606;
const SEKOLAH_LNG = 105.8861026;

// Radius maksimal absensi dalam meter
const BATAS_RADIUS = 100;

const btnAbsen = document.getElementById("btnAbsen");
const pesan = document.getElementById("pesan");

btnAbsen.addEventListener("click", ambilLokasi);

function ambilLokasi() {
  const namaLengkap = document.getElementById("namaLengkap").value;
  const keterangan = document.getElementById("keterangan").value;

  if (!namaLengkap) {
    tampilkanPesan("Silakan pilih nama lengkap.", "error");
    return;
  }

  if (!keterangan) {
    tampilkanPesan("Silakan pilih keterangan.", "error");
    return;
  }

  if (!navigator.geolocation) {
    tampilkanPesan("Browser tidak mendukung fitur lokasi.", "error");
    return;
  }

  btnAbsen.disabled = true;
  tampilkanPesan("Mengambil lokasi... Mohon izinkan akses lokasi.", "");

  navigator.geolocation.getCurrentPosition(
    async function(position) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const akurasi = Math.round(position.coords.accuracy);

      const jarak = hitungJarakMeter(
        SEKOLAH_LAT,
        SEKOLAH_LNG,
        latitude,
        longitude
      );

    if (
    (keterangan === "Hadir" || keterangan === "Terlambat") &&
    jarak > BATAS_RADIUS
    ) {
    tampilkanPesan(
        `Absensi ditolak. Jarak Anda sekitar ${Math.round(jarak)} meter dari sekolah. Batas maksimal ${BATAS_RADIUS} meter.`,
        "error"
    );
    btnAbsen.disabled = false;
    return;
    }

      await simpanAbsensi({
        namaLengkap,
        keterangan,
        latitude,
        longitude,
        akurasi,
        jarak: Math.round(jarak)
      });
    },
    function(error) {
      let pesanError = "Gagal mengambil lokasi.";

      if (error.code === 1) {
        pesanError = "Akses lokasi ditolak. Silakan izinkan lokasi di browser.";
      } else if (error.code === 2) {
        pesanError = "Lokasi tidak tersedia. Pastikan GPS aktif dan internet stabil.";
      } else if (error.code === 3) {
        pesanError = "Pengambilan lokasi terlalu lama. Coba aktifkan GPS dan ulangi.";
      }

      tampilkanPesan(pesanError, "error");
      btnAbsen.disabled = false;
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
}

async function simpanAbsensi(data) {
  try {
    const titikKoordinat = `${data.latitude}, ${data.longitude}`;
    const linkMap = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;

    await addDoc(collection(db, "absensi"), {
      timestamp: serverTimestamp(),
      namaLengkap: data.namaLengkap,
      keterangan: data.keterangan,
      titikKoordinat: titikKoordinat,
      latitude: data.latitude,
      longitude: data.longitude,
      akurasiAlamat: `${data.akurasi} meter`,
      jarakDariSekolah: `${data.jarak} meter`,
      linkMap: linkMap,
      lokasiSekolah: "SDIT Safinatunnajah"
    });

    tampilkanPesan(
      `Absensi berhasil disimpan. Jarak dari sekolah sekitar ${data.jarak} meter.`,
      "success"
    );

    document.getElementById("namaLengkap").value = "";
    document.getElementById("keterangan").value = "";
  } catch (error) {
    console.error(error);
    tampilkanPesan("Gagal menyimpan data ke Firebase.", "error");
  }

  btnAbsen.disabled = false;
}

function hitungJarakMeter(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = derajatKeRadian(lat2 - lat1);
  const dLon = derajatKeRadian(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(derajatKeRadian(lat1)) *
    Math.cos(derajatKeRadian(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function derajatKeRadian(deg) {
  return deg * (Math.PI / 180);
}

function tampilkanPesan(teks, tipe) {
  pesan.className = tipe;
  pesan.innerHTML = teks;
}
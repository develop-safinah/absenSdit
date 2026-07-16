import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import { getPegawai } from "./dbPegawai.js";


// =========================
// Firebase
// =========================

const firebaseConfig = {
    apiKey: "ISI_DENGAN_APIKEY_YANG_SAMA_DENGAN_ADMIN",
    authDomain: "absensi-sdit-9a872.firebaseapp.com",
    projectId: "absensi-sdit-9a872",
    storageBucket: "absensi-sdit-9a872.firebasestorage.app",
    messagingSenderId: "196616421068",
    appId: "1:196616421068:web:0b64690ce5dbdcdd77cc69",
    measurementId: "G-D015K9FE6M"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// =========================
// Konstanta
// =========================

const SEKOLAH_LAT = -6.1217606;
const SEKOLAH_LNG = 105.8861026;
const BATAS_RADIUS = 100;


// =========================
// Element
// =========================

const btnAbsen = document.getElementById("btnAbsen");
const pesan = document.getElementById("pesan");
const selectPegawai = document.getElementById("peserta");
const selectKeterangan = document.getElementById("keterangan");


// =========================
// Inisialisasi
// =========================

loadPegawai();

btnAbsen.addEventListener("click", ambilLokasi);


// =========================
// Load Pegawai
// =========================

function loadPegawai() {

    const pegawai = getPegawai();

    selectPegawai.innerHTML =
        `<option value="">-- Pilih Nama --</option>`;

    pegawai.forEach(nama => {

        selectPegawai.innerHTML += `
            <option value="${nama}">
                ${nama}
            </option>
        `;

    });

}


// =========================
// Ambil Lokasi
// =========================

function ambilLokasi() {

    const namaLengkap = selectPegawai.value;
    const keterangan = selectKeterangan.value;

    if (!namaLengkap) {

        tampilkanPesan(
            "Silakan pilih nama pegawai.",
            "danger"
        );

        return;
    }

    if (!keterangan) {

        tampilkanPesan(
            "Silakan pilih keterangan.",
            "danger"
        );

        return;
    }

    if (!navigator.geolocation) {

        tampilkanPesan(
            "Browser tidak mendukung GPS.",
            "danger"
        );

        return;
    }

    btnAbsen.disabled = true;

    tampilkanPesan(
        "Mengambil lokasi...",
        "info"
    );

    navigator.geolocation.getCurrentPosition(

        async function (position) {

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
                (keterangan === "Hadir" ||
                    keterangan === "Terlambat") &&
                jarak > BATAS_RADIUS
            ) {

                tampilkanPesan(
                    `Absensi ditolak.<br>Jarak Anda ${Math.round(jarak)} meter dari sekolah.`,
                    "danger"
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

        function (error) {

            let pesanError = "Gagal mengambil lokasi.";

            if (error.code === 1)
                pesanError = "Izin lokasi ditolak.";

            if (error.code === 2)
                pesanError = "Lokasi tidak tersedia.";

            if (error.code === 3)
                pesanError = "Timeout mengambil lokasi.";

            tampilkanPesan(
                pesanError,
                "danger"
            );

            btnAbsen.disabled = false;

        },

        {

            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0

        }

    );

}


// =========================
// Simpan Firebase
// =========================

async function simpanAbsensi(data) {

    try {

        const titikKoordinat =
            `${data.latitude}, ${data.longitude}`;

        const linkMap =
            `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;

        await addDoc(collection(db, "absensi"), {

            timestamp: serverTimestamp(),

            namaLengkap: data.namaLengkap,

            keterangan: data.keterangan,

            titikKoordinat,

            latitude: data.latitude,

            longitude: data.longitude,

            akurasiAlamat: `${data.akurasi} meter`,

            jarakDariSekolah: `${data.jarak} meter`,

            linkMap,

            lokasiSekolah: "SDIT Safinatunnajah"

        });

        tampilkanPesan(

            `Absensi berhasil disimpan.<br>Jarak dari sekolah ${data.jarak} meter.`,

            "success"

        );

        selectPegawai.value = "";
        selectKeterangan.value = "";

    }

    catch (error) {

        console.error(error);

        tampilkanPesan(
            "Gagal menyimpan data.",
            "danger"
        );

    }

    btnAbsen.disabled = false;

}


// =========================
// Hitung Jarak
// =========================

function hitungJarakMeter(lat1, lon1, lat2, lon2) {

    const R = 6371000;

    const dLat = derajatKeRadian(lat2 - lat1);

    const dLon = derajatKeRadian(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(derajatKeRadian(lat1)) *
        Math.cos(derajatKeRadian(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
    );

    return R * c;

}

function derajatKeRadian(deg) {

    return deg * Math.PI / 180;

}


// =========================
// Bootstrap Alert
// =========================

function tampilkanPesan(teks, tipe = "info") {

    pesan.innerHTML = `

        <div class="alert alert-${tipe} mt-3">

            ${teks}

        </div>

    `;

}
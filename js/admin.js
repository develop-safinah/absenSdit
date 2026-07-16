import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import { auth, db } from "./firebase.js";
import { login, logout } from "./auth.js";

const loginBox = document.getElementById("loginBox");
const adminPanel = document.getElementById("adminPanel");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");
const btnTerapkan = document.getElementById("btnTerapkan");
const btnExport = document.getElementById("btnExport");
const loginPesan = document.getElementById("loginPesan");
const adminPesan = document.getElementById("adminPesan");
const tbodyAbsensi = document.getElementById("tbodyAbsensi");

let semuaData = [];
let dataTampil = [];

btnLogin.addEventListener("click", loginAdmin);
btnLogout.addEventListener("click", logoutAdmin);
btnTerapkan.addEventListener("click", terapkanFilter);
btnExport.addEventListener("click", exportCSV);

onAuthStateChanged(auth, async function(user) {
  if (user) {
   loginBox.classList.add("d-none");
    adminPanel.classList.remove("d-none");
    await muatDataAbsensi();
  } else {
    loginBox.classList.remove("d-none");
    adminPanel.classList.add("d-none");
  }
});

async function loginAdmin() {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    tampilkanLoginPesan("Email dan password wajib diisi.", "error");
    return;
  }

  btnLogin.disabled = true;
  tampilkanLoginPesan("Sedang login...", "");

  try {
    await login(email, password);
    tampilkanLoginPesan("", "");
  } catch (error) {
    console.error(error);
    tampilkanLoginPesan(
      "Login gagal: " + error.code,
      "error"
    );
  }

  btnLogin.disabled = false;
}

async function logoutAdmin() {
  await logout();
}

async function muatDataAbsensi() {
  adminPesan.className = "";
  adminPesan.innerHTML = "Memuat data absensi...";

  try {
    const q = query(collection(db, "absensi"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);

    semuaData = [];

    querySnapshot.forEach(function(doc) {
      semuaData.push({
        id: doc.id,
        ...doc.data()
      });
    });

    const hariIni = new Date().toISOString().slice(0, 10);

    document.getElementById("tanggalMulai").value = hariIni;
    document.getElementById("tanggalSelesai").value = hariIni;
    terapkanFilter();

    adminPesan.innerHTML = "";
  } catch (error) {
    console.error(error);
    adminPesan.className = "error";
    adminPesan.innerHTML = "Gagal memuat data. Pastikan rules Firebase dan akun admin sudah benar.";
  }
}

function terapkanFilter() {
  const tanggalMulai = document.getElementById("tanggalMulai").value;
  const tanggalSelesai = document.getElementById("tanggalSelesai").value;
  const filterKeterangan = document.getElementById("filterKeterangan").value;

  dataTampil = semuaData.filter(function(item) {
    const tanggalItem = ubahTimestampKeDate(item.timestamp);

    if (!tanggalItem) return false;

    const yyyyMmDd = formatInputDate(tanggalItem);

    const cocokTanggalMulai = !tanggalMulai || yyyyMmDd >= tanggalMulai;
    const cocokTanggalSelesai = !tanggalSelesai || yyyyMmDd <= tanggalSelesai;
    const cocokKeterangan = !filterKeterangan || item.keterangan === filterKeterangan;

    return cocokTanggalMulai && cocokTanggalSelesai && cocokKeterangan;
  });

  renderTabel(dataTampil);
  renderSummary(dataTampil);
}

function renderTabel(data) {
  tbodyAbsensi.innerHTML = "";

  if (data.length === 0) {
    tbodyAbsensi.innerHTML = `
      <tr>
        <td colspan="9" style="text-align:center;">Data tidak ditemukan.</td>
      </tr>
    `;
    return;
  }

  data.forEach(function(item, index) {
    const tanggalObj = ubahTimestampKeDate(item.timestamp);
    const tanggal = tanggalObj ? formatTanggalIndonesia(tanggalObj) : "-";
    const jam = tanggalObj ? formatJam(tanggalObj) : "-";

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${tanggal}</td>
      <td>${jam}</td>
      <td>${item.namaLengkap || "-"}</td>
      <td>${item.keterangan || "-"}</td>
      <td>${item.titikKoordinat || "-"}</td>
      <td>${item.akurasiAlamat || "-"}</td>
      <td>${item.jarakDariSekolah || "-"}</td>
      <td>
        ${
          item.linkMap
            ? `<a href="${item.linkMap}" target="_blank">Buka Map</a>`
            : "-"
        }
      </td>
    `;

    tbodyAbsensi.appendChild(row);
  });
}

function renderSummary(data) {
  document.getElementById("totalData").innerText = data.length;
  document.getElementById("totalHadir").innerText = data.filter(x => x.keterangan === "Hadir").length;
  document.getElementById("totalTerlambat").innerText = data.filter(x => x.keterangan === "Terlambat").length;
  document.getElementById("totalIzin").innerText = data.filter(x => x.keterangan === "Izin").length;
  document.getElementById("totalSakit").innerText = data.filter(x => x.keterangan === "Sakit").length;
}

function exportCSV() {
  if (dataTampil.length === 0) {
    alert("Tidak ada data untuk diexport.");
    return;
  }

  const header = [
    "No",
    "Tanggal",
    "Jam",
    "Nama Lengkap",
    "Keterangan",
    "Titik Koordinat",
    "Akurasi Alamat",
    "Jarak Dari Sekolah",
    "Link Map"
  ];

  const rows = dataTampil.map(function(item, index) {
    const tanggalObj = ubahTimestampKeDate(item.timestamp);
    const tanggal = tanggalObj ? formatTanggalIndonesia(tanggalObj) : "-";
    const jam = tanggalObj ? formatJam(tanggalObj) : "-";

    return [
      index + 1,
      tanggal,
      jam,
      item.namaLengkap || "-",
      item.keterangan || "-",
      item.titikKoordinat || "-",
      item.akurasiAlamat || "-",
      item.jarakDariSekolah || "-",
      item.linkMap || "-"
    ];
  });

  const csvContent = [header, ...rows]
    .map(row => row.map(escapeCSV).join(";"))
    .join("\n");

  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], {
    type: "text/csv;charset=utf-8;"
  });

  const tanggalFile = new Date().toISOString().slice(0, 10);
  const namaFile = `rekap-absensi-sdit-${tanggalFile}.csv`;

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = namaFile;
  link.click();

  URL.revokeObjectURL(link.href);
}

function escapeCSV(value) {
  const stringValue = String(value).replace(/"/g, '""');
  return `"${stringValue}"`;
}

function ubahTimestampKeDate(timestamp) {
  if (!timestamp) return null;

  if (timestamp.toDate) {
    return timestamp.toDate();
  }

  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000);
  }

  return null;
}

function formatTanggalIndonesia(date) {
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function formatJam(date) {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function formatInputDate(date) {
  return date.toISOString().slice(0, 10);
}

function tampilkanLoginPesan(teks, tipe) {
  loginPesan.className = tipe;
  loginPesan.innerHTML = teks;
}
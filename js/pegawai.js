import { cekLogin } from "./auth.js";
import { getPegawai, savePegawai } from "./dbPegawai.js";

let pegawai = [];

const inputNama = document.getElementById("namaPegawai");
const btnTambah = document.getElementById("btnTambah");

btnTambah.addEventListener("click", tambahPegawai);

cekLogin(() => {

    pegawai = getPegawai();

    tampilkanPegawai();

});

function tambahPegawai() {

    const nama = inputNama.value.trim();

    if (nama === "") {
        alert("Nama pegawai harus diisi.");
        return;
    }

    pegawai.push(nama);

    savePegawai(pegawai);

    tampilkanPegawai();

    inputNama.value = "";

    inputNama.focus();

}



function editPegawai(index) {

    const namaBaru = prompt(
        "Edit Nama Pegawai",
        pegawai[index]
    );

    if (namaBaru === null) return;

    if (namaBaru.trim() === "") {
        alert("Nama tidak boleh kosong.");
        return;
    }

    pegawai[index] = namaBaru.trim();

    savePegawai(pegawai);

    tampilkanPegawai();

}

function hapusPegawai(index) {

    const yakin = confirm(
        "Yakin ingin menghapus pegawai ini?"
    );

    if (!yakin) return;

    pegawai.splice(index, 1);

    savePegawai(pegawai);

    tampilkanPegawai();

}

function tampilkanPegawai() {

    const tbody = document.getElementById("tbodyPegawai");

    tbody.innerHTML = "";

    pegawai.forEach((nama, index) => {

        tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${nama}</td>
                    <td class="text-center">

                        <button
                            class="btn btn-warning btn-sm btnEdit"
                            data-index="${index}">

                            Edit

                        </button>

                        <button
                            class="btn btn-danger btn-sm btnHapus"
                            data-index="${index}">

                            Hapus

                        </button>

                    </td>
            </tr>
        `;

    });

        // Tombol Edit
    document.querySelectorAll(".btnEdit").forEach(btn => {

        btn.addEventListener("click", function () {

            editPegawai(this.dataset.index);

        });

    });

    // Tombol Hapus
    document.querySelectorAll(".btnHapus").forEach(btn => {

        btn.addEventListener("click", function () {

            hapusPegawai(this.dataset.index);

        });

    });

}
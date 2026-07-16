const STORAGE_KEY = "pegawai";

const defaultPegawai = [
    "Lutfiah, S.Pd",
    "Siti Laelatul Lutfiah, S.Pd",
    "Elis Rosmiati",
    "Widdi Agustini",
    "Malyya Azizah Nurfitria, S.Hum",
    "Iis Rodiatul Magpuroh, S.Pd",
    "Nuraenah, S.Pd",
    "Raudotul Janah",
    "Tia Munjiah",
    "Aris Firdaus, S.H",
    "Ati Sulastri, S.Sos",
    "Rahmat, S.Pd",
    "Siva Oktavianti",
    "Suroji Anwar",
    "Esih Sukaesih",
    "Rokayah",
    "Fatihah Inayah",
    "Rihhadatul Asyi",
    "Shireen"
];

// Ambil data
export function getPegawai() {

    const data = localStorage.getItem(STORAGE_KEY);

    if (data) {
        return JSON.parse(data);
    }

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(defaultPegawai)
    );

    return defaultPegawai;
}

export function savePegawai(data) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

}
import { Student } from '../types';

export const MAPEL_TKA_OPTIONS = [
  'Matematika',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Matematika Tingkat Lanjut',
  'Bahasa Indonesia Tingkat Lanjut',
  'Bahasa Inggris Tingkat Lanjut',
  'Fisika',
  'Kimia',
  'Biologi',
  'Pendidikan Pancasila dan Kewarganegaraan',
  'Ekonomi',
  'Geografi',
  'Sosiologi',
  'Sejarah',
  'Antropologi',
  'Bahasa Prancis',
  'Bahasa Jerman',
  'Bahasa Jepang',
  'Bahasa Mandarin',
  'Bahasa Korea',
  'Bahasa Arab',
];

export const UNIVERSITAS_POPULAR_OPTIONS = [
  'Institut Teknologi Bandung (ITB)',
  'Universitas Indonesia (UI)',
  'Universitas Gadjah Mada (UGM)',
  'Institut Teknologi Sepuluh Nopember (ITS)',
  'Universitas Airlangga (UNAIR)',
  'Universitas Padjadjaran (UNPAD)',
  'Universitas Diponegoro (UNDIP)',
  'Universitas Brawijaya (UB)',
  'Universitas Sebelas Maret (UNS)',
  'IPB University',
  'Universitas Pendidikan Indonesia (UPI)',
  'Universitas Negeri Yogyakarta (UNY)',
  'Universitas Negeri Malang (UM)',
  'Universitas Negeri Jakarta (UNJ)',
  'Universitas Hasanuddin (UNHAS)',
  'Universitas Sumatra Utara (USU)',
  'Politeknik Negeri Bandung (POLBAN)',
  'Politeknik Negeri Jakarta (PNJ)',
  'STIS / STAN / IPDN / STIN / AKMIL / AKPOL',
  'Perguruan Tinggi Swasta (PTS)',
];

export const PRODI_POPULAR_OPTIONS = [
  'Teknik Informatika / Ilmu Komputer',
  'Pendidikan Dokter / Kedokteran Umum',
  'Teknik Elektro',
  'Teknik Mesin',
  'Teknik Sipil',
  'Teknik Industri',
  'Sekolah Bisnis dan Manajemen (SBM) / Manajemen',
  'Akuntansi',
  'Hukum',
  'Farmasi',
  'Psikologi',
  'Ilmu Komunikasi',
  'Hubungan Internasional',
  'Sistem Informasi',
  'Statistika / Sains Data',
  'Pendidikan Matematika',
  'Pendidikan Bahasa Inggris',
  'Desain Komunikasi Visual (DKV)',
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-101',
    namaSiswa: 'Ahmad Fauzi Nurrahman',
    nis: '22231001',
    nisn: '0061234561',
    kelas: 'XII Merdeka 1',
    jenisKelamin: 'L',
    mapelTka1: 'Matematika Tingkat Lanjut',
    mapelTka2: 'Fisika',
    pilihanStudiLanjut: 'Kuliah',
    ptn1: 'Institut Teknologi Bandung (ITB)',
    prodiPilihan1: 'Teknik Informatika',
    ptn2: 'Institut Teknologi Sepuluh Nopember (ITS)',
    prodiPilihan2: 'Teknik Informatika',
    noHp: '081234567890',
    fotoSiswa: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256',
    prestasiList: [
      {
        id: 'p-101-1',
        namaPrestasi: 'Juara 1 Olimpiade Sains Nasional (OSN) Matematika',
        jenis: 'Akademik',
        tingkat: 'Nasional',
        lembaga: 'Puspresnas / Kemendikbudristek',
      },
      {
        id: 'p-101-2',
        namaPrestasi: 'Juara 2 Hackathon Pelajar Komputer',
        jenis: 'Non-Akademik',
        tingkat: 'Provinsi',
        lembaga: 'Dinas Pendidikan Provinsi',
      },
    ],
    catatan: 'Persiapan SNBP & TKA Saintek sangat matang',
    updatedAt: '2026-08-01',
  },
  {
    id: 'std-102',
    namaSiswa: 'Anisa Rahmawati',
    nis: '22231002',
    nisn: '0061234562',
    kelas: 'XII Merdeka 1',
    jenisKelamin: 'P',
    mapelTka1: 'Biologi',
    mapelTka2: 'Kimia',
    pilihanStudiLanjut: 'Kuliah',
    ptn1: 'Universitas Indonesia (UI)',
    prodiPilihan1: 'Pendidikan Dokter (Kedokteran)',
    ptn2: 'Universitas Gadjah Mada (UGM)',
    prodiPilihan2: 'Kedokteran Umum',
    noHp: '081234567891',
    fotoSiswa: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    prestasiList: [
      {
        id: 'p-102-1',
        namaPrestasi: 'Juara 1 Olimpiade Biologi SMA Se-Jawa Barat',
        jenis: 'Akademik',
        tingkat: 'Provinsi',
        lembaga: 'FKM Universitas Indonesia',
      },
    ],
    catatan: 'Peringkat 1 Pararel Kelas XII',
    updatedAt: '2026-08-02',
  },
  {
    id: 'std-103',
    namaSiswa: 'Bintang Putra Pratama',
    nis: '22231003',
    nisn: '0061234563',
    kelas: 'XII Merdeka 2',
    jenisKelamin: 'L',
    mapelTka1: 'Ekonomi',
    mapelTka2: 'Sosiologi',
    pilihanStudiLanjut: 'AKADEMI',
    prodiPilihan1: '-',
    prodiPilihan2: '-',
    noHp: '081234567892',
    prestasiList: [
      {
        id: 'p-103-1',
        namaPrestasi: 'Juara 1 Lomba Baris Berbaris & Paskibraka',
        jenis: 'Non-Akademik',
        tingkat: 'Kota/Kabupaten',
        lembaga: 'Dispora Kota',
      },
    ],
    catatan: 'Persiapan Seleksi Akpol & Kedinasan STIN',
    updatedAt: '2026-08-03',
  },
  {
    id: 'std-104',
    namaSiswa: 'Citra Dewi Kartika',
    nis: '22231004',
    nisn: '0061234564',
    kelas: 'XII Merdeka 2',
    jenisKelamin: 'P',
    mapelTka1: 'Geografi',
    mapelTka2: 'Ekonomi',
    pilihanStudiLanjut: 'Kuliah',
    prodiPilihan1: 'UI - Hukum',
    prodiPilihan2: 'UGM - Hukum',
    noHp: '081234567893',
    prestasiList: [
      {
        id: 'p-104-1',
        namaPrestasi: 'Juara 1 Debat Bahasa Indonesia Pelajar Nasional',
        jenis: 'Akademik',
        tingkat: 'Nasional',
        lembaga: 'Puspresnas Kemendikbudristek',
      },
    ],
    catatan: 'Juara Debat Bahasa Indonesia Nasional',
    updatedAt: '2026-08-03',
  },
  {
    id: 'std-105',
    namaSiswa: 'Daffa Rizky Ramadhan',
    nis: '22231005',
    nisn: '0061234565',
    kelas: 'XII Merdeka 3',
    jenisKelamin: 'L',
    mapelTka1: 'Matematika Lanjut',
    mapelTka2: 'Informatika',
    pilihanStudiLanjut: 'Kuliah',
    prodiPilihan1: 'UI - Ilmu Komputer',
    prodiPilihan2: 'ITB - Teknik Elektro',
    noHp: '081234567894',
    prestasiList: [],
    catatan: 'Tertarik pada AI & Software Engineering',
    updatedAt: '2026-08-04',
  },
  {
    id: 'std-106',
    namaSiswa: 'Eka Nur Syamsiah',
    nis: '22231006',
    nisn: '0061234566',
    kelas: 'XII Merdeka 3',
    jenisKelamin: 'P',
    mapelTka1: 'Fisika',
    mapelTka2: 'Kimia',
    pilihanStudiLanjut: 'Bekerja',
    prodiPilihan1: '-',
    prodiPilihan2: '-',
    noHp: '081234567895',
    prestasiList: [],
    catatan: 'Fokus persiapan sertifikasi keahlian & kerja',
    updatedAt: '2026-08-04',
  },
  {
    id: 'std-107',
    namaSiswa: 'Farhan Aditya Nugraha',
    nis: '22231007',
    nisn: '0061234567',
    kelas: 'XII Merdeka 4',
    jenisKelamin: 'L',
    mapelTka1: 'Sosiologi',
    mapelTka2: 'Sejarah',
    pilihanStudiLanjut: 'Kuliah',
    prodiPilihan1: 'UNPAD - Ilmu Komunikasi',
    prodiPilihan2: 'UGM - Psikologi',
    noHp: '081234567896',
    prestasiList: [],
    catatan: 'Suka broadcasting & komunikasi publik',
    updatedAt: '2026-08-05',
  },
  {
    id: 'std-108',
    namaSiswa: 'Gita Savitri Maharani',
    nis: '22231008',
    nisn: '0061234568',
    kelas: 'XII Merdeka 4',
    jenisKelamin: 'P',
    mapelTka1: 'Bahasa Inggris Tingkat Lanjut',
    mapelTka2: 'Sosiologi',
    pilihanStudiLanjut: 'Kuliah',
    prodiPilihan1: 'UGM - Psikologi',
    prodiPilihan2: 'UNAIR - Manajemen',
    noHp: '081234567897',
    prestasiList: [],
    catatan: 'Sertifikat TOEFL 580',
    updatedAt: '2026-08-05',
  },
  {
    id: 'std-109',
    namaSiswa: 'Hadi Kurniawan',
    nis: '22231009',
    nisn: '0061234569',
    kelas: 'XII Merdeka 1',
    jenisKelamin: 'L',
    mapelTka1: 'Biologi',
    mapelTka2: 'Kimia',
    pilihanStudiLanjut: 'Kuliah',
    prodiPilihan1: 'UNAIR - Kedokteran',
    prodiPilihan2: 'UNPAD - Kedokteran',
    noHp: '081234567898',
    prestasiList: [],
    catatan: 'Target Kedokteran UNAIR Mandiri/SNBT',
    updatedAt: '2026-08-05',
  },
  {
    id: 'std-110',
    namaSiswa: 'Intan Permata Sari',
    nis: '22231010',
    nisn: '0061234570',
    kelas: 'XII Merdeka 2',
    jenisKelamin: 'P',
    mapelTka1: 'Ekonomi',
    mapelTka2: 'Matematika Lanjut',
    pilihanStudiLanjut: 'Kuliah',
    prodiPilihan1: 'UB - Manajemen',
    prodiPilihan2: 'UNDIP - Akuntansi',
    noHp: '081234567899',
    prestasiList: [],
    catatan: 'Portofolio kewirausahaan muda',
    updatedAt: '2026-08-06',
  },
];

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * Google Apps Script Backend - Administrasi Pendataan TKA & Studi Lanjut
 * Salin kode ini ke Google Apps Script (Extensions > Apps Script di Google Sheets Anda)
 * Lalu Deploy sebagai Web App dengan Akses: "Anyone" (Siapa Saja)
 */

const SHEET_NAME = "Data_Siswa_TKA";

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  const headers = [
    "ID", "Nama Siswa", "NIS", "NISN", "Kelas", "Jenis Kelamin",
    "Mapel TKA 1", "Mapel TKA 2", "Prodi Pilihan 1", "Prodi Pilihan 2",
    "No HP", "Catatan", "Waktu Diperbarui"
  ];
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#1e293b")
               .setFontColor("#ffffff")
               .setFontWeight("bold")
               .setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doGet(e) {
  try {
    const sheet = setupSheet();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return responseJSON({ status: "success", data: [] });
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    const result = rows.map(row => {
      return {
        id: row[0],
        namaSiswa: row[1],
        nis: row[2].toString(),
        nisn: row[3].toString(),
        kelas: row[4],
        jenisKelamin: row[5],
        mapelTka1: row[6],
        mapelTka2: row[7],
        prodiPilihan1: row[8],
        prodiPilihan2: row[9],
        noHp: row[10] ? row[10].toString() : "",
        catatan: row[11],
        updatedAt: row[12]
      };
    });
    
    return responseJSON({ status: "success", data: result });
  } catch (error) {
    return responseJSON({ status: "error", message: error.toString() });
  }
}

function doPost(e) {
  try {
    const contents = JSON.parse(e.postData.contents);
    const action = contents.action || "save";
    const sheet = setupSheet();
    
    if (action === "save" || action === "update") {
      const student = contents.student;
      const data = sheet.getDataRange().getValues();
      let rowIndex = -1;
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] == student.id || data[i][2] == student.nis) {
          rowIndex = i + 1; // 1-based index
          break;
        }
      }
      
      const rowData = [
        student.id || "std-" + Date.now(),
        student.namaSiswa,
        student.nis,
        student.nisn,
        student.kelas,
        student.jenisKelamin,
        student.mapelTka1,
        student.mapelTka2,
        student.prodiPilihan1,
        student.prodiPilihan2,
        student.noHp || "",
        student.catatan || "",
        new Date().toISOString().split("T")[0]
      ];
      
      if (rowIndex > 0) {
        sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
      } else {
        sheet.appendRow(rowData);
      }
      
      return responseJSON({ status: "success", message: "Data berhasil disimpan!", student: student });
    }
    
    if (action === "delete") {
      const studentId = contents.id;
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] == studentId) {
          sheet.deleteRow(i + 1);
          return responseJSON({ status: "success", message: "Data berhasil dihapus" });
        }
      }
      return responseJSON({ status: "error", message: "Data tidak ditemukan" });
    }
    
    return responseJSON({ status: "error", message: "Action tidak dikenal" });
  } catch (error) {
    return responseJSON({ status: "error", message: error.toString() });
  }
}

function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

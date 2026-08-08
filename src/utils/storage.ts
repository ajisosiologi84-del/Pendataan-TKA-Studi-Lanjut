import { Student, LaptopData, ProktorTeknisi, DocumentSettings } from '../types';
import { INITIAL_STUDENTS } from '../data/mockStudents';
import { INITIAL_LAPTOPS } from '../data/mockLaptops';

const STORAGE_KEY = 'tka_studi_lanjut_students_v1';
const LAPTOPS_STORAGE_KEY = 'tka_laptops_data_v1';
const PROKTOR_STORAGE_KEY = 'tka_proktor_teknisi_v1';
const DOC_SETTINGS_STORAGE_KEY = 'tka_doc_settings_v1';
const GAS_URL_KEY = 'tka_apps_script_url_v1';

export const DEFAULT_PROKTOR_TEKNISI: ProktorTeknisi[] = [
  {
    id: 'pt-1',
    kodeRuang: 'Lab Komputer 1',
    noUrutLaptop: '01 - 20',
    namaTeknisi: 'Budi Santoso, S.Kom',
    nipTeknisi: '19850315 201001 1 002',
    namaProktor: 'Drs. H. Ahmad Fauzi',
    nipProktor: '19780112 200501 1 005',
    keterangan: 'Penanggung jawab Lab 1 (Gelombang 1 & Khusus)',
  },
  {
    id: 'pt-2',
    kodeRuang: 'Lab Komputer 2',
    noUrutLaptop: '01 - 20',
    namaTeknisi: 'Hendra Wijaya, S.ST',
    nipTeknisi: '19900822 201502 1 003',
    namaProktor: 'Siti Rahmah, S.Pd',
    nipProktor: '19820510 200801 2 008',
    keterangan: 'Penanggung jawab Lab 2 (Gelombang 2)',
  },
];

export const DEFAULT_DOCUMENT_SETTINGS: DocumentSettings = {
  namaSekolah: 'PANITIA TES KEMAMPUAN AKADEMIK (TKA) & ASESMEN NASIONAL 2026',
  subHeader: 'SMA / MA / SMK KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI',
  alamatSekolah: 'Jl. Pendidikan Nasional No. 123 | Email: panitiatka2026@sekolah.sch.id',
  kotaTanggal: 'Jakarta, 12 Oktober 2026',
  namaKepalaSekolah: 'Dr. H. Mulyadi, M.Pd.',
  nipKepalaSekolah: '19700505 199503 1 001',
  nomorSuratPrefix: '042/PAN-TKA/AN-2026',
  judulSuratOrtu: 'SURAT PERNYATAAN KESEDIAAN MEMINJAMKAN LAPTOP',
  keteranganSuratOrtu:
    'Yang bertanda tangan di bawah ini, pihak Orang Tua / Wali dan Siswa peserta Tes Kemampuan Akademik (TKA) & Asesmen Nasional Tahun 2026 menyatakan bersedia meminjamkan perangkat laptop pribadi untuk kegiatan ujian TKA.',
  judulFormTeknisi: 'FORMULIR PENDATAAN & BERITA ACARA INSPEKSI LAPTOP TKA 2026',
  keteranganFormTeknisi:
    'Lembar verifikasi kelengkapan hardware (Charger, Mouse, Keyboard) dan penentuan status kelayakan (LAYAK / TIDAK LAYAK) oleh Tim Teknisi Komputer.',
};

export function getStoredStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_STUDENTS;
  } catch (error) {
    console.error('Error reading students from localStorage:', error);
    return INITIAL_STUDENTS;
  }
}

export function saveStudents(students: Student[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  } catch (error) {
    console.error('Error saving students to localStorage:', error);
  }
}

export function addStudent(data: Omit<Student, 'id' | 'updatedAt'>): Student {
  const students = getStoredStudents();
  const newStudent: Student = {
    ...data,
    id: 'std-' + Date.now(),
    updatedAt: new Date().toISOString().split('T')[0],
  };
  const updatedList = [newStudent, ...students];
  saveStudents(updatedList);
  return newStudent;
}

export function updateStudent(updated: Student): void {
  const students = getStoredStudents();
  const index = students.findIndex((s) => s.id === updated.id);
  if (index !== -1) {
    students[index] = {
      ...updated,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    saveStudents(students);
  }
}

export function deleteStudent(id: string): void {
  const students = getStoredStudents();
  const filtered = students.filter((s) => s.id !== id);
  saveStudents(filtered);
}

export function addMultipleStudents(
  newStudentsData: Omit<Student, 'id' | 'updatedAt'>[],
  mode: 'append' | 'overwrite' = 'append'
): Student[] {
  const dateStr = new Date().toISOString().split('T')[0];
  const formatted: Student[] = newStudentsData.map((data, index) => ({
    ...data,
    id: 'std-' + (Date.now() + index),
    updatedAt: dateStr,
  }));

  let updatedList: Student[];
  if (mode === 'overwrite') {
    updatedList = formatted;
  } else {
    const existing = getStoredStudents();
    updatedList = [...formatted, ...existing];
  }

  saveStudents(updatedList);
  return updatedList;
}

export function resetToDefaultData(): Student[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STUDENTS));
  return INITIAL_STUDENTS;
}

export function exportStudentsToCSV(students: Student[]): void {
  const headers = [
    'ID',
    'Nama Siswa',
    'NIS',
    'NISN',
    'Kelas',
    'Jenis Kelamin',
    'Mata Pelajaran TKA 1',
    'Mata Pelajaran TKA 2',
    'Prodi Pilihan 1',
    'Prodi Pilihan 2',
    'No HP',
    'Catatan',
    'Tanggal Update',
  ];

  const rows = students.map((s) => [
    `"${s.id}"`,
    `"${s.namaSiswa.replace(/"/g, '""')}"`,
    `"${s.nis}"`,
    `"${s.nisn}"`,
    `"${s.kelas}"`,
    `"${s.jenisKelamin}"`,
    `"${s.mapelTka1}"`,
    `"${s.mapelTka2}"`,
    `"${s.prodiPilihan1.replace(/"/g, '""')}"`,
    `"${s.prodiPilihan2.replace(/"/g, '""')}"`,
    `"${s.noHp || ''}"`,
    `"${(s.catatan || '').replace(/"/g, '""')}"`,
    `"${s.updatedAt}"`,
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Data_Siswa_TKA_StudiLanjut_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function getAppsScriptUrl(): string {
  return localStorage.getItem(GAS_URL_KEY) || '';
}

export function saveAppsScriptUrl(url: string): void {
  localStorage.setItem(GAS_URL_KEY, url.trim());
}

/* ==========================================================================
   LAPTOP INVENTORY STORAGE HELPERS
   ========================================================================== */

export function getStoredLaptops(): LaptopData[] {
  try {
    const raw = localStorage.getItem(LAPTOPS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LAPTOPS_STORAGE_KEY, JSON.stringify(INITIAL_LAPTOPS));
      return INITIAL_LAPTOPS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_LAPTOPS;
  } catch (error) {
    console.error('Error reading laptops from localStorage:', error);
    return INITIAL_LAPTOPS;
  }
}

export function saveLaptops(laptops: LaptopData[]): void {
  try {
    localStorage.setItem(LAPTOPS_STORAGE_KEY, JSON.stringify(laptops));
  } catch (error) {
    console.error('Error saving laptops to localStorage:', error);
  }
}

export function addLaptop(data: Omit<LaptopData, 'id' | 'updatedAt'>): LaptopData {
  const laptops = getStoredLaptops();
  const newLaptop: LaptopData = {
    ...data,
    id: 'lap-' + Date.now(),
    updatedAt: new Date().toISOString().split('T')[0],
  };
  const updatedList = [newLaptop, ...laptops];
  saveLaptops(updatedList);
  return newLaptop;
}

export function updateLaptop(updated: LaptopData): void {
  const laptops = getStoredLaptops();
  const index = laptops.findIndex((l) => l.id === updated.id);
  if (index !== -1) {
    laptops[index] = {
      ...updated,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    saveLaptops(laptops);
  }
}

export function deleteLaptop(id: string): void {
  const laptops = getStoredLaptops();
  const filtered = laptops.filter((l) => l.id !== id);
  saveLaptops(filtered);
}

export function resetLaptopsData(): LaptopData[] {
  localStorage.setItem(LAPTOPS_STORAGE_KEY, JSON.stringify(INITIAL_LAPTOPS));
  return INITIAL_LAPTOPS;
}

/* ==========================================================================
   PROKTOR & TEKNISI STORAGE HELPERS
   ========================================================================== */

export function getStoredProktorTeknisi(): ProktorTeknisi[] {
  try {
    const raw = localStorage.getItem(PROKTOR_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PROKTOR_STORAGE_KEY, JSON.stringify(DEFAULT_PROKTOR_TEKNISI));
      return DEFAULT_PROKTOR_TEKNISI;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_PROKTOR_TEKNISI;
  } catch (error) {
    console.error('Error reading proktor teknisi:', error);
    return DEFAULT_PROKTOR_TEKNISI;
  }
}

export function saveProktorTeknisi(data: ProktorTeknisi[]): void {
  try {
    localStorage.setItem(PROKTOR_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving proktor teknisi:', error);
  }
}

export function addProktorTeknisi(item: Omit<ProktorTeknisi, 'id'>): ProktorTeknisi {
  const list = getStoredProktorTeknisi();
  const newItem: ProktorTeknisi = {
    ...item,
    id: 'pt-' + Date.now(),
  };
  const updated = [newItem, ...list];
  saveProktorTeknisi(updated);
  return newItem;
}

export function updateProktorTeknisi(item: ProktorTeknisi): void {
  const list = getStoredProktorTeknisi();
  const index = list.findIndex((p) => p.id === item.id);
  if (index !== -1) {
    list[index] = item;
    saveProktorTeknisi(list);
  }
}

export function deleteProktorTeknisi(id: string): void {
  const list = getStoredProktorTeknisi();
  const filtered = list.filter((p) => p.id !== id);
  saveProktorTeknisi(filtered);
}

/* ==========================================================================
   DOCUMENT SETTINGS STORAGE HELPERS
   ========================================================================== */

export function getStoredDocSettings(): DocumentSettings {
  try {
    const raw = localStorage.getItem(DOC_SETTINGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DOC_SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_DOCUMENT_SETTINGS));
      return DEFAULT_DOCUMENT_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_DOCUMENT_SETTINGS, ...parsed };
  } catch (error) {
    console.error('Error reading doc settings:', error);
    return DEFAULT_DOCUMENT_SETTINGS;
  }
}

export function saveDocSettings(settings: DocumentSettings): void {
  try {
    localStorage.setItem(DOC_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving doc settings:', error);
  }
}

export interface PortalBackupPayload {
  version: string;
  exportDate: string;
  appName: string;
  students: Student[];
  laptops: LaptopData[];
  proktorList: ProktorTeknisi[];
  docSettings: DocumentSettings;
  appsScriptUrl: string;
}

export function generatePortalBackupJson(): string {
  const payload: PortalBackupPayload = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    appName: 'Portal TKA & Laptop Inventaris',
    students: getStoredStudents(),
    laptops: getStoredLaptops(),
    proktorList: getStoredProktorTeknisi(),
    docSettings: getStoredDocSettings(),
    appsScriptUrl: getAppsScriptUrl(),
  };
  return JSON.stringify(payload, null, 2);
}

export function restorePortalFromBackupJson(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString) as PortalBackupPayload;
    if (!data || typeof data !== 'object') {
      throw new Error('Format JSON tidak valid.');
    }
    if (data.students && Array.isArray(data.students)) {
      saveStudents(data.students);
    }
    if (data.laptops && Array.isArray(data.laptops)) {
      saveLaptops(data.laptops);
    }
    if (data.proktorList && Array.isArray(data.proktorList)) {
      saveProktorTeknisi(data.proktorList);
    }
    if (data.docSettings && typeof data.docSettings === 'object') {
      saveDocSettings(data.docSettings);
    }
    if (typeof data.appsScriptUrl === 'string') {
      saveAppsScriptUrl(data.appsScriptUrl);
    }
    return true;
  } catch (err) {
    console.error('Restore backup error:', err);
    return false;
  }
}

/* ==========================================================================
   LIVE GOOGLE SHEETS ACCESS SETTING STORAGE HELPERS
   ========================================================================== */

const LIVE_SHEETS_ACCESS_KEY = 'tka_live_sheets_access_v1';

export function getStoredLiveSheetsAccess(): boolean {
  try {
    const raw = localStorage.getItem(LIVE_SHEETS_ACCESS_KEY);
    if (raw === null) return false; // Default closed for general users, admin can open/close
    return JSON.parse(raw) === true;
  } catch (error) {
    console.error('Error reading live sheets access setting:', error);
    return false;
  }
}

export function saveLiveSheetsAccess(isOpen: boolean): void {
  try {
    localStorage.setItem(LIVE_SHEETS_ACCESS_KEY, JSON.stringify(isOpen));
  } catch (error) {
    console.error('Error saving live sheets access setting:', error);
  }
}




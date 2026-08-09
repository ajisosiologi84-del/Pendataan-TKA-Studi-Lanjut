import {
  Student,
  LaptopData,
  ProktorTeknisi,
  DocumentSettings,
  RolePermissions,
  CustomUserAccount,
  SystemSecurityPolicy,
  ActiveUserSession
} from '../types';
import {
  syncStudentToFirestore,
  deleteStudentFromFirestore,
  syncLaptopToFirestore,
  syncSecurityLogToFirestore,
  syncSystemSettingsToFirestore
} from '../firebase';
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
  syncStudentToFirestore(newStudent);
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
    syncStudentToFirestore(students[index]);
  }
}

export function deleteStudent(id: string): void {
  const students = getStoredStudents();
  const filtered = students.filter((s) => s.id !== id);
  saveStudents(filtered);
  deleteStudentFromFirestore(id);
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

/* ==========================================================================
   SYSTEM PASSWORDS & SECURITY AUDIT LOG HELPERS
   ========================================================================== */

const SYSTEM_PASSWORDS_KEY = 'tka_system_passwords_v1';
const SECURITY_LOGS_KEY = 'tka_security_logs_v1';

export interface SystemPasswords {
  superadmin: string;
  walikelas: string;
  bk: string;
  proktor: string;
  teknisi: string;
}

export const DEFAULT_SYSTEM_PASSWORDS: SystemPasswords = {
  superadmin: 'admin123',
  walikelas: 'walikelas',
  bk: 'bk',
  proktor: 'proktor123',
  teknisi: 'teknisi123',
};

export function getStoredSystemPasswords(): SystemPasswords {
  try {
    const raw = localStorage.getItem(SYSTEM_PASSWORDS_KEY);
    if (!raw) {
      localStorage.setItem(SYSTEM_PASSWORDS_KEY, JSON.stringify(DEFAULT_SYSTEM_PASSWORDS));
      return DEFAULT_SYSTEM_PASSWORDS;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SYSTEM_PASSWORDS, ...parsed };
  } catch (error) {
    console.error('Error reading system passwords:', error);
    return DEFAULT_SYSTEM_PASSWORDS;
  }
}

export function saveSystemPasswords(passwords: SystemPasswords, syncRemote = true): void {
  try {
    localStorage.setItem(SYSTEM_PASSWORDS_KEY, JSON.stringify(passwords));
    if (syncRemote) {
      syncSystemSettingsToFirestore('passwords', passwords);
    }
  } catch (error) {
    console.error('Error saving system passwords:', error);
  }
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  role: string;
  userIdentifier?: string;
  action: string;
  category: 'AUTH' | 'DATA_CHANGE' | 'SETTINGS' | 'SYSTEM';
  status: 'SUCCESS' | 'FAILED' | 'WARNING';
  details: string;
}

export function getStoredSecurityLogs(): SecurityLog[] {
  try {
    const raw = localStorage.getItem(SECURITY_LOGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading security logs:', error);
    return [];
  }
}

export function addSecurityLog(logData: Omit<SecurityLog, 'id' | 'timestamp'>): SecurityLog {
  const existing = getStoredSecurityLogs();
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) + ' ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const newLog: SecurityLog = {
    ...logData,
    id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    timestamp: dateStr,
  };

  // Keep last 300 logs to optimize memory
  const updated = [newLog, ...existing].slice(0, 300);
  try {
    localStorage.setItem(SECURITY_LOGS_KEY, JSON.stringify(updated));
    syncSecurityLogToFirestore(newLog);
  } catch (err) {
    console.error('Error saving security log:', err);
  }
  return newLog;
}

export function clearSecurityLogs(): void {
  try {
    localStorage.removeItem(SECURITY_LOGS_KEY);
  } catch (err) {
    console.error('Error clearing security logs:', err);
  }
}

/* ==========================================================================
   ADVANCED ROLE PERMISSIONS MATRIX & SECURITY POLICIES
   ========================================================================== */

const ACCESS_MATRIX_KEY = 'tka_access_matrix_v2';
const SECURITY_POLICY_KEY = 'tka_security_policy_v2';
const CUSTOM_USERS_KEY = 'tka_custom_users_v2';
const ACTIVE_SESSIONS_KEY = 'tka_active_sessions_v2';

export const DEFAULT_ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  superadmin: {
    canEditStudent: true,
    canDeleteStudent: true,
    canExportData: true,
    canImportData: true,
    canManageLaptops: true,
    canManageSettings: true,
    canViewAuditLogs: true,
    canAccessBanPt: true,
    canManageUsers: true,
    canResetDatabase: true,
  },
  walikelas: {
    canEditStudent: false,
    canDeleteStudent: false,
    canExportData: true,
    canImportData: false,
    canManageLaptops: false,
    canManageSettings: false,
    canViewAuditLogs: false,
    canAccessBanPt: true,
    canManageUsers: false,
    canResetDatabase: false,
  },
  bk: {
    canEditStudent: true,
    canDeleteStudent: false,
    canExportData: true,
    canImportData: false,
    canManageLaptops: false,
    canManageSettings: false,
    canViewAuditLogs: false,
    canAccessBanPt: true,
    canManageUsers: false,
    canResetDatabase: false,
  },
  panitia: {
    canEditStudent: true,
    canDeleteStudent: false,
    canExportData: true,
    canImportData: true,
    canManageLaptops: true,
    canManageSettings: false,
    canViewAuditLogs: false,
    canAccessBanPt: false,
    canManageUsers: false,
    canResetDatabase: false,
  },
  read_only: {
    canEditStudent: false,
    canDeleteStudent: false,
    canExportData: true,
    canImportData: false,
    canManageLaptops: false,
    canManageSettings: false,
    canViewAuditLogs: false,
    canAccessBanPt: true,
    canManageUsers: false,
    canResetDatabase: false,
  },
  proktor: {
    canEditStudent: false,
    canDeleteStudent: false,
    canExportData: true,
    canImportData: false,
    canManageLaptops: true,
    canManageSettings: false,
    canViewAuditLogs: false,
    canAccessBanPt: true,
    canManageUsers: false,
    canResetDatabase: false,
  },
  teknisi: {
    canEditStudent: false,
    canDeleteStudent: false,
    canExportData: true,
    canImportData: false,
    canManageLaptops: true,
    canManageSettings: false,
    canViewAuditLogs: false,
    canAccessBanPt: true,
    canManageUsers: false,
    canResetDatabase: false,
  },
};

export const DEFAULT_SECURITY_POLICY: SystemSecurityPolicy = {
  minPasswordLength: 8,
  requireNumbers: true,
  requireSpecialChar: true,
  requireUppercase: true,
  maxLoginAttempts: 5,
  lockoutMinutes: 15,
  sessionTimeoutMinutes: 15,
  enableTwoFactorPin: true,
  securityPin: '123456',
  forcePasswordPeriodDays: 90,
};

export const DEFAULT_CUSTOM_USERS: CustomUserAccount[] = [
  {
    id: 'usr-admin-1',
    username: 'admin.utama',
    fullName: 'Drs. H. Mulyono, M.Pd (Super Administrator)',
    role: 'superadmin',
    passwordHash: 'Admin#2026!',
    status: 'AKTIF',
    kelasAkses: 'ALL',
    createdAt: '2026-01-10',
    lastLogin: '2026-08-08 19:30'
  },
  {
    id: 'usr-wali-1',
    username: '198503122010011002',
    fullName: 'Budi Santoso, S.Pd (Wali XII MIPA 1)',
    role: 'walikelas',
    passwordHash: 'WaliKelas#123',
    status: 'AKTIF',
    kelasAkses: 'XII MIPA 1',
    createdAt: '2026-01-15',
    lastLogin: '2026-08-07 14:20'
  },
  {
    id: 'usr-bk-1',
    username: '197908222005012001',
    fullName: 'Siti Aminah, M.Psi (Guru Bimbingan Konseling)',
    role: 'bk',
    passwordHash: 'GuruBK#2026',
    status: 'AKTIF',
    kelasAkses: 'ALL',
    createdAt: '2026-01-15',
    lastLogin: '2026-08-08 09:15'
  },
  {
    id: 'usr-proktor-1',
    username: 'proktor.lab1',
    fullName: 'Drs. H. Ahmad Fauzi (Proktor Lab 1)',
    role: 'proktor',
    passwordHash: 'proktor123',
    status: 'AKTIF',
    kelasAkses: 'ALL',
    createdAt: '2026-01-15',
    lastLogin: '2026-08-08 08:00'
  },
  {
    id: 'usr-teknisi-1',
    username: 'teknisi.lab1',
    fullName: 'Budi Santoso, S.Kom (Teknisi Lab 1)',
    role: 'teknisi',
    passwordHash: 'teknisi123',
    status: 'AKTIF',
    kelasAkses: 'ALL',
    createdAt: '2026-01-15',
    lastLogin: '2026-08-08 08:00'
  },
];

export function getStoredRolePermissions(): Record<string, RolePermissions> {
  try {
    const raw = localStorage.getItem(ACCESS_MATRIX_KEY);
    if (!raw) {
      localStorage.setItem(ACCESS_MATRIX_KEY, JSON.stringify(DEFAULT_ROLE_PERMISSIONS));
      return DEFAULT_ROLE_PERMISSIONS;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading role permissions:', error);
    return DEFAULT_ROLE_PERMISSIONS;
  }
}

export function saveRolePermissions(matrix: Record<string, RolePermissions>, syncRemote = true): void {
  try {
    localStorage.setItem(ACCESS_MATRIX_KEY, JSON.stringify(matrix));
    if (syncRemote) {
      syncSystemSettingsToFirestore('rolePermissions', matrix);
    }
  } catch (error) {
    console.error('Error saving role permissions:', error);
  }
}

export function getStoredSecurityPolicy(): SystemSecurityPolicy {
  try {
    const raw = localStorage.getItem(SECURITY_POLICY_KEY);
    if (!raw) {
      localStorage.setItem(SECURITY_POLICY_KEY, JSON.stringify(DEFAULT_SECURITY_POLICY));
      return DEFAULT_SECURITY_POLICY;
    }
    return { ...DEFAULT_SECURITY_POLICY, ...JSON.parse(raw) };
  } catch (error) {
    console.error('Error reading security policy:', error);
    return DEFAULT_SECURITY_POLICY;
  }
}

export function saveSecurityPolicy(policy: SystemSecurityPolicy, syncRemote = true): void {
  try {
    localStorage.setItem(SECURITY_POLICY_KEY, JSON.stringify(policy));
    if (syncRemote) {
      syncSystemSettingsToFirestore('securityPolicy', policy);
    }
  } catch (error) {
    console.error('Error saving security policy:', error);
  }
}

export function getStoredCustomUsers(): CustomUserAccount[] {
  try {
    const raw = localStorage.getItem(CUSTOM_USERS_KEY);
    if (!raw) {
      localStorage.setItem(CUSTOM_USERS_KEY, JSON.stringify(DEFAULT_CUSTOM_USERS));
      return DEFAULT_CUSTOM_USERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_CUSTOM_USERS;
  } catch (error) {
    console.error('Error reading custom users:', error);
    return DEFAULT_CUSTOM_USERS;
  }
}

export function saveCustomUsers(users: CustomUserAccount[], syncRemote = true): void {
  try {
    localStorage.setItem(CUSTOM_USERS_KEY, JSON.stringify(users));
    if (syncRemote) {
      syncSystemSettingsToFirestore('customUsers', users);
    }
  } catch (error) {
    console.error('Error saving custom users:', error);
  }
}

export function getStoredActiveSessions(): ActiveUserSession[] {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSIONS_KEY);
    if (!raw) {
      const initialSession: ActiveUserSession = {
        sessionId: 'sess-' + Date.now(),
        username: 'admin.utama',
        role: 'Super Admin',
        deviceInfo: 'Chrome / macOS (Sesi Aktif Ini)',
        ipAddress: '180.252.112.44',
        loginTime: new Date().toLocaleString('id-ID'),
        lastActive: 'Baru saja',
        isCurrent: true,
      };
      localStorage.setItem(ACTIVE_SESSIONS_KEY, JSON.stringify([initialSession]));
      return [initialSession];
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading active sessions:', error);
    return [];
  }
}

export function clearActiveSessionsExceptCurrent(): void {
  try {
    const sessions = getStoredActiveSessions();
    const currentOnly = sessions.filter((s) => s.isCurrent);
    localStorage.setItem(ACTIVE_SESSIONS_KEY, JSON.stringify(currentOnly));
  } catch (error) {
    console.error('Error clearing sessions:', error);
  }
}






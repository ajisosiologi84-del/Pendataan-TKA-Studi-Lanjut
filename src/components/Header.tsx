import React from 'react';
import { Menu, Plus, Download, RefreshCw, Database } from 'lucide-react';
import { NavigationTab, Student } from '../types';
import { exportStudentsToCSV } from '../utils/storage';

interface HeaderProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  students: Student[];
  setIsMobileOpen: (open: boolean) => void;
  onRefreshData?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  students,
  setIsMobileOpen,
  onRefreshData,
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Dashboard Pendataan',
          subtitle: 'Ringkasan statistik TKA & Pilihan Studi Lanjut siswa kelas XII',
        };
      case 'students':
        return {
          title: 'Data Siswa TKA & Studi Lanjut',
          subtitle: 'Kelola data siswa, NIS, NISN, Pilihan Mapel TKA 1-2 & Prodi 1-2',
        };
      case 'form':
        return {
          title: 'Formulir Pendataan Siswa',
          subtitle: 'Isi data administrasi siswa secara rinci dan terstruktur',
        };
      case 'analysis':
        return {
          title: 'Analisis Pilihan Mapel & Prodi',
          subtitle: 'Distribusi frekuensi mata pelajaran pilihan TKA dan program studi',
        };
      case 'appscript':
        return {
          title: 'Google Apps Script Integration Hub',
          subtitle: 'Integrasi otomatis spreadsheet Google Apps Script (Code.gs)',
        };
      case 'laptop':
        return {
          title: 'Pendataan Laptop & Sarana Ujian TKA',
          subtitle: 'Pendataan spesifikasi, kelengkapan laptop, serta cetak surat kesediaan & berita acara',
        };
      case 'banpt':
        return {
          title: 'Direktori Prodi PTN Seluruh Indonesia (BAN-PT)',
          subtitle: 'Pencarian resmi status akreditasi program studi Perguruan Tinggi Negeri dari BAN-PT Kemdikbud',
        };
      case 'mapelPilihan':
        return {
          title: 'Mata Pelajaran Pilihan Pendukung Program Studi',
          subtitle: 'Matriks kesesuaian mata pelajaran SMA dengan program studi perguruan tinggi (SNBP / Kurikulum Merdeka)',
        };
      default:
        return { title: 'Pendataan Siswa', subtitle: 'Aplikasi Administrasi' };
    }
  };

  const { title, subtitle } = getTabTitle();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-3">
        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden"
          title="Buka Menu Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg lg:text-xl font-bold text-slate-800 tracking-tight">
              {title}
            </h2>
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200" title="Terhubung ke Firebase Firestore Cloud Database">
              <Database className="w-3 h-3 text-amber-600" /> Firebase Cloud Active
            </span>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {onRefreshData && (
          <button
            onClick={onRefreshData}
            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Muat Ulang Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => exportStudentsToCSV(students)}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>

        {activeTab !== 'form' && (
          <button
            onClick={() => setActiveTab('form')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        )}
      </div>
    </header>
  );
};

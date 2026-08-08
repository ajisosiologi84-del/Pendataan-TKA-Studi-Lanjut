import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Users,
  Code2,
  Database,
  Save,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  ShieldCheck,
  FileText,
  Laptop,
  HardDrive,
  Download,
  Upload,
  FileJson,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { DocumentSettings, ProktorTeknisi } from '../types';
import { generatePortalBackupJson, restorePortalFromBackupJson } from '../utils/storage';

interface SettingsViewProps {
  docSettings: DocumentSettings;
  onSaveDocSettings: (settings: DocumentSettings) => void;
  onResetDocSettings: () => void;
  proktorList: ProktorTeknisi[];
  onAddProktor: (data: Omit<ProktorTeknisi, 'id'>) => void;
  onUpdateProktor: (data: ProktorTeknisi) => void;
  onDeleteProktor: (id: string) => void;
  appsScriptUrl: string;
  onSaveAppsScriptUrl: (url: string) => void;
  onResetStudentsData: () => void;
  onResetLaptopsData: () => void;
  totalStudents: number;
  totalLaptops: number;
  onDataRestored?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  docSettings,
  onSaveDocSettings,
  onResetDocSettings,
  proktorList,
  onAddProktor,
  onUpdateProktor,
  onDeleteProktor,
  appsScriptUrl,
  onSaveAppsScriptUrl,
  onResetStudentsData,
  onResetLaptopsData,
  totalStudents,
  totalLaptops,
  onDataRestored,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'kop' | 'proktor' | 'appscript' | 'database' | 'backup'>('kop');
  const [settingsForm, setSettingsForm] = useState<DocumentSettings>({ ...docSettings });
  const [gasUrlInput, setGasUrlInput] = useState(appsScriptUrl);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Backup & Upload animation states
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  // New Proktor modal / form state
  const [isAddingProktor, setIsAddingProktor] = useState(false);
  const [editingProktorId, setEditingProktorId] = useState<string | null>(null);
  const [proktorForm, setProktorForm] = useState<Omit<ProktorTeknisi, 'id'>>({
    kodeRuang: 'Lab Komputer 3',
    noUrutLaptop: '01 - 20',
    namaTeknisi: '',
    nipTeknisi: '',
    namaProktor: '',
    nipProktor: '',
    keterangan: '',
  });

  const handleSaveKop = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDocSettings(settingsForm);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveGas = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAppsScriptUrl(gasUrlInput);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDownloadBackup = () => {
    setIsDownloading(true);
    setUploadMessage(null);
    setTimeout(() => {
      try {
        const jsonStr = generatePortalBackupJson();
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Backup_Portal_TKA_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setUploadMessage('✓ Berkas backup JSON berhasil diunduh!');
      } catch (err) {
        console.error('Download backup error:', err);
        setUploadMessage('❌ Gagal mengunduh berkas backup.');
      } finally {
        setIsDownloading(false);
      }
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setTimeout(() => {
        try {
          const content = event.target?.result as string;
          const success = restorePortalFromBackupJson(content);
          if (success) {
            setUploadMessage('✓ Data portal berhasil dipulihkan dengan aman dari berkas JSON!');
            if (onDataRestored) onDataRestored();
          } else {
            setUploadMessage('❌ Gagal memulihkan data: Format berkas JSON tidak valid.');
          }
        } catch (err) {
          console.error(err);
          setUploadMessage('❌ Terjadi kesalahan saat membaca berkas JSON.');
        } finally {
          setIsUploading(false);
          if (e.target) e.target.value = '';
        }
      }, 1500);
    };
    reader.onerror = () => {
      setIsUploading(false);
      setUploadMessage('❌ Gagal membaca berkas.');
    };
    reader.readAsText(file);
  };

  const handleProktorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proktorForm.kodeRuang || !proktorForm.namaTeknisi || !proktorForm.namaProktor) {
      alert('Mohon isi minimal Kode Ruang, Nama Teknisi, dan Nama Proktor.');
      return;
    }

    if (editingProktorId) {
      onUpdateProktor({ ...proktorForm, id: editingProktorId });
      setEditingProktorId(null);
    } else {
      onAddProktor(proktorForm);
    }

    setProktorForm({
      kodeRuang: 'Lab Komputer Baru',
      noUrutLaptop: '01 - 20',
      namaTeknisi: '',
      nipTeknisi: '',
      namaProktor: '',
      nipProktor: '',
      keterangan: '',
    });
    setIsAddingProktor(false);
  };

  const startEditProktor = (item: ProktorTeknisi) => {
    setProktorForm({
      kodeRuang: item.kodeRuang,
      noUrutLaptop: item.noUrutLaptop,
      namaTeknisi: item.namaTeknisi,
      nipTeknisi: item.nipTeknisi || '',
      namaProktor: item.namaProktor,
      nipProktor: item.nipProktor || '',
      keterangan: item.keterangan || '',
    });
    setEditingProktorId(item.id);
    setIsAddingProktor(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" /> Pusat Kontrol Administrator
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Pengaturan & Konfigurasi Portal TKA
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Kelola identitas kop surat cetak PDF, penanggung jawab lab/proktor/teknisi, integrasi Apps Script, dan backup JSON aman.
          </p>
        </div>
        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold animate-pulse shadow-xs">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            Pengaturan berhasil disimpan!
          </div>
        )}
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('kop')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'kop'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" /> Kop Surat & Dokumen PDF
        </button>
        <button
          onClick={() => setActiveSubTab('proktor')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'proktor'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" /> Proktor & Teknisi Lab ({proktorList.length})
        </button>
        <button
          onClick={() => setActiveSubTab('appscript')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'appscript'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Code2 className="w-4 h-4" /> Google Apps Script Sync
        </button>
        <button
          onClick={() => setActiveSubTab('backup')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'backup'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileJson className="w-4 h-4" /> Backup & Pemulihan JSON
        </button>
        <button
          onClick={() => setActiveSubTab('database')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'database'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4" /> Manajemen Data & Reset
        </button>
      </div>

      {/* SECTION: BACKUP & PEMULIHAN JSON */}
      {activeSubTab === 'backup' && (
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FileJson className="w-5 h-5 text-indigo-600" /> Backup & Pemulihan Data Aman (Format JSON)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Unduh seluruh konfigurasi portal, data siswa, inventaris laptop, dan proktor dalam satu file JSON terenkripsi/terstruktur atau pulihkan data dari file cadangan sebelumnya.
            </p>
          </div>

          {uploadMessage && (
            <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-xs ${
              uploadMessage.includes('❌') ? 'bg-rose-50 border border-rose-200 text-rose-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{uploadMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DOWNLOAD BACKUP BOX */}
            <div className="border-2 border-dashed border-indigo-200 bg-indigo-50/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 transition-all hover:border-indigo-400">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-xs">
                {isDownloading ? (
                  <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
                ) : (
                  <Download className="w-7 h-7" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 uppercase">Unduh Backup Data JSON</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Simpan cadangan lengkap data portal (Siswa, Laptop, Proktor, & Kop Surat) ke perangkat komputer Anda.
                </p>
              </div>
              <button
                onClick={handleDownloadBackup}
                disabled={isDownloading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Menyiapkan Berkas Backup...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Download Backup (.json)
                  </>
                )}
              </button>
            </div>

            {/* UPLOAD / RESTORE BACKUP BOX */}
            <div className="border-2 border-dashed border-emerald-200 bg-emerald-50/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 transition-all hover:border-emerald-400 relative">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-xs">
                {isUploading ? (
                  <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
                ) : (
                  <Upload className="w-7 h-7" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 uppercase">Pulihkan Data (Upload JSON)</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Pilih file backup JSON sebelumnya untuk memulihkan seluruh data siswa dan inventaris secara instan.
                </p>
              </div>
              <label className={`px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Memulihkan & Sinkronisasi Data...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" /> Pilih Berkas Backup JSON
                  </>
                )}
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" /> Keamanan & Integritas Data JSON:
            </div>
            <p className="leading-relaxed">
              Format JSON yang dihasilkan memuat stempel waktu (timestamp) ekspor dan verifikasi struktur lengkap. Proses restore akan memperbarui penyimpanan lokal browser secara aman tanpa mengirimkan data keluar ke server eksternal.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 1: KOP SURAT & DOKUMEN PDF */}
      {activeSubTab === 'kop' && (
        <form onSubmit={handleSaveKop} className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-6">
...
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" /> Pengaturan Kop Surat & Header Cetak Dokumen PDF
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Informasi ini otomatis tampil di bagian atas Surat Kesediaan Ortu, Berita Acara Teknisi, dan Stiker Ujian TKA.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Nama Instansi / Sekolah / Panitia</label>
              <input
                type="text"
                value={settingsForm.namaSekolah}
                onChange={(e) => setSettingsForm({ ...settingsForm, namaSekolah: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Sub Header / Kementerian / Yayasan</label>
              <input
                type="text"
                value={settingsForm.subHeader}
                onChange={(e) => setSettingsForm({ ...settingsForm, subHeader: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Alamat & Kontak Sekolah / Email</label>
              <input
                type="text"
                value={settingsForm.alamatSekolah}
                onChange={(e) => setSettingsForm({ ...settingsForm, alamatSekolah: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Kota & Tanggal Dokumen</label>
              <input
                type="text"
                value={settingsForm.kotaTanggal}
                onChange={(e) => setSettingsForm({ ...settingsForm, kotaTanggal: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Nomor Surat Prefix / Kode</label>
              <input
                type="text"
                value={settingsForm.nomorSuratPrefix}
                onChange={(e) => setSettingsForm({ ...settingsForm, nomorSuratPrefix: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Nama Kepala Sekolah / Pejabat Penanggung Jawab</label>
              <input
                type="text"
                value={settingsForm.namaKepalaSekolah}
                onChange={(e) => setSettingsForm({ ...settingsForm, namaKepalaSekolah: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">NIP Kepala Sekolah</label>
              <input
                type="text"
                value={settingsForm.nipKepalaSekolah}
                onChange={(e) => setSettingsForm({ ...settingsForm, nipKepalaSekolah: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Judul Surat Pernyataan Orang Tua</label>
              <input
                type="text"
                value={settingsForm.judulSuratOrtu}
                onChange={(e) => setSettingsForm({ ...settingsForm, judulSuratOrtu: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Keterangan / Pembuka Surat Orang Tua</label>
              <textarea
                rows={3}
                value={settingsForm.keteranganSuratOrtu}
                onChange={(e) => setSettingsForm({ ...settingsForm, keteranganSuratOrtu: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                required
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">Judul Formulir Teknisi & Berita Acara</label>
              <input
                type="text"
                value={settingsForm.judulFormTeknisi}
                onChange={(e) => setSettingsForm({ ...settingsForm, judulFormTeknisi: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Kembalikan pengaturan kop surat ke default awal?')) {
                  onResetDocSettings();
                  setSettingsForm({ ...docSettings });
                }
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Reset Default
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/25 transition-all"
            >
              <Save className="w-4 h-4" /> Simpan Pengaturan Kop Surat
            </button>
          </div>
        </form>
      )}

      {/* SECTION 2: PROKTOR & TEKNISI LAB */}
      {activeSubTab === 'proktor' && (
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" /> Manajemen Penanggung Jawab Lab, Proktor, & Teknisi
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Atur daftar ruangan lab komputer ujian TKA beserta nama proktor dan teknisi yang bertugas.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingProktorId(null);
                setProktorForm({
                  kodeRuang: 'Lab Komputer ' + (proktorList.length + 1),
                  noUrutLaptop: '01 - 20',
                  namaTeknisi: '',
                  nipTeknisi: '',
                  namaProktor: '',
                  nipProktor: '',
                  keterangan: '',
                });
                setIsAddingProktor(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Tambah Ruangan Lab Baru
            </button>
          </div>

          {/* Add / Edit Proktor Modal Form inline */}
          {isAddingProktor && (
            <form onSubmit={handleProktorSubmit} className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-900">
                  {editingProktorId ? 'Edit Data Lab, Proktor & Teknisi' : 'Tambah Ruangan Lab Baru'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingProktor(false)}
                  className="text-slate-500 hover:text-slate-900 text-xs font-bold"
                >
                  ✕ Batal
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Kode / Nama Ruang Lab</label>
                  <input
                    type="text"
                    value={proktorForm.kodeRuang}
                    onChange={(e) => setProktorForm({ ...proktorForm, kodeRuang: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                    placeholder="Misal: Lab Komputer 1"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Nomor Urut / Range Laptop</label>
                  <input
                    type="text"
                    value={proktorForm.noUrutLaptop}
                    onChange={(e) => setProktorForm({ ...proktorForm, noUrutLaptop: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                    placeholder="Misal: 01 - 20"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Keterangan Lab</label>
                  <input
                    type="text"
                    value={proktorForm.keterangan}
                    onChange={(e) => setProktorForm({ ...proktorForm, keterangan: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                    placeholder="Misal: Sesi 1 & 2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Nama Teknisi Lab</label>
                  <input
                    type="text"
                    value={proktorForm.namaTeknisi}
                    onChange={(e) => setProktorForm({ ...proktorForm, namaTeknisi: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                    placeholder="Nama lengkap & gelar"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">NIP Teknisi (Opsional)</label>
                  <input
                    type="text"
                    value={proktorForm.nipTeknisi}
                    onChange={(e) => setProktorForm({ ...proktorForm, nipTeknisi: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                    placeholder="Nomor NIP"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex gap-2 items-end h-full">
                    <button
                      type="submit"
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm"
                    >
                      {editingProktorId ? 'Simpan Perubahan' : 'Tambah Lab Baru'}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Nama Proktor Lab</label>
                  <input
                    type="text"
                    value={proktorForm.namaProktor}
                    onChange={(e) => setProktorForm({ ...proktorForm, namaProktor: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                    placeholder="Nama lengkap & gelar"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">NIP Proktor (Opsional)</label>
                  <input
                    type="text"
                    value={proktorForm.nipProktor}
                    onChange={(e) => setProktorForm({ ...proktorForm, nipProktor: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                    placeholder="Nomor NIP"
                  />
                </div>
              </div>
            </form>
          )}

          {/* Proktor / Lab Table List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proktorList.map((item) => (
              <div key={item.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 space-y-3 shadow-2xs hover:border-indigo-300 transition-all">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg font-black text-xs">
                      {item.kodeRuang}
                    </span>
                    <span className="text-xs font-bold text-slate-600">No. {item.noUrutLaptop}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEditProktor(item)}
                      className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Hapus data ruangan ${item.kodeRuang}?`)) {
                          onDeleteProktor(item.id);
                        }
                      }}
                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Teknisi Bertugas</span>
                    <strong className="text-slate-900 block font-bold">{item.namaTeknisi}</strong>
                    <span className="text-[10px] text-slate-500 font-mono">{item.nipTeknisi || 'NIP -'}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Proktor Bertugas</span>
                    <strong className="text-slate-900 block font-bold">{item.namaProktor}</strong>
                    <span className="text-[10px] text-slate-500 font-mono">{item.nipProktor || 'NIP -'}</span>
                  </div>
                </div>

                {item.keterangan && (
                  <p className="text-[11px] text-slate-500 italic bg-white/60 p-2 rounded-lg border border-slate-200">
                    ℹ️ {item.keterangan}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: GOOGLE APPS SCRIPT */}
      {activeSubTab === 'appscript' && (
        <form onSubmit={handleSaveGas} className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indigo-600" /> Integrasi Google Apps Script & Cloud Sheets
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Hubungkan portal dengan Google Spreadsheet menggunakan Web App URL untuk sinkronisasi data siswa secara real-time.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase">Google Apps Script Web App URL</label>
            <input
              type="url"
              value={gasUrlInput}
              onChange={(e) => setGasUrlInput(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-slate-500 leading-relaxed">
              💡 Masukkan URL deployment web app Google Apps Script Anda. Jika dikosongkan, aplikasi berjalan menggunakan penyimpanan lokal browser (localStorage).
            </p>
          </div>

          <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-4 space-y-2 text-xs text-indigo-950">
            <div className="font-bold flex items-center gap-1.5 text-indigo-900">
              <ShieldCheck className="w-4 h-4 text-indigo-600" /> Status Koneksi Integrasi:
            </div>
            <p className="text-indigo-900">
              {appsScriptUrl ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  ✓ Web App URL terkonfigurasi dan aktif ({appsScriptUrl.substring(0, 40)}...)
                </span>
              ) : (
                <span className="text-amber-700 font-bold">
                  ⚠️ Belum dikonfigurasi (Menggunakan mode penyimpanan lokal browser).
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setGasUrlInput('')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Hapus / Putuskan
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/25 transition-all"
            >
              <Save className="w-4 h-4" /> Simpan URL Apps Script
            </button>
          </div>
        </form>
      )}

      {/* SECTION 4: MANAJEMEN DATA & RESET */}
      {activeSubTab === 'database' && (
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" /> Pusat Pemeliharaan & Reset Basis Data Portal
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Kelola data mentah, pulihkan data bawaan sampel, atau bersihkan penyimpanan lokal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span className="font-bold text-sm text-slate-900">Database Siswa TKA</span>
                </div>
                <span className="bg-indigo-100 text-indigo-800 text-xs font-black px-2.5 py-1 rounded-full font-mono">
                  {totalStudents} Siswa
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Reset seluruh data siswa kembali ke data sampel bawaan awal (untuk pengujian atau pemulihan data).
              </p>
              <button
                onClick={() => {
                  if (window.confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh data siswa ke data bawaan awal? Data baru yang diinput akan hilang.')) {
                    onResetStudentsData();
                    alert('Data siswa berhasil direset ke default.');
                  }
                }}
                className="w-py px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
              >
                <RotateCcw className="w-4 h-4" /> Reset Data Siswa ke Default
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-indigo-600" />
                  <span className="font-bold text-sm text-slate-900">Database Laptop & Inventaris</span>
                </div>
                <span className="bg-indigo-100 text-indigo-800 text-xs font-black px-2.5 py-1 rounded-full font-mono">
                  {totalLaptops} Laptop
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Reset pendataan laptop siswa dan status kelayakan teknisi kembali ke daftar sampel awal.
              </p>
              <button
                onClick={() => {
                  if (window.confirm('PERINGATAN: Apakah Anda yakin ingin mereset pendataan laptop siswa ke data awal?')) {
                    onResetLaptopsData();
                    alert('Data inventaris laptop berhasil direset ke default.');
                  }
                }}
                className="w-py px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
              >
                <RotateCcw className="w-4 h-4" /> Reset Inventaris Laptop ke Default
              </button>
            </div>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600" /> Zona Perhatian / Cache Browser
            </div>
            <p className="text-xs text-rose-800 leading-relaxed">
              Seluruh data portal disimpan secara aman di dalam <strong className="font-bold">localStorage</strong> browser Anda. Pastikan untuk selalu mengunduh cadangan CSV atau JSON sebelum membersihkan riwayat browser agar data tidak hilang.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

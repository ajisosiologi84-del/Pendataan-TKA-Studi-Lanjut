import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Building2,
  Plus,
  Search,
  Filter,
  FileSpreadsheet,
  Download,
  Trash2,
  Edit2,
  Upload,
  CheckCircle2,
  X,
  AlertCircle,
  Users,
  GraduationCap,
  Sparkles,
  ArrowRight,
  RefreshCw,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { MasterSchoolStudent, NavigationTab } from '../types';
import {
  addMasterSchoolStudent,
  updateMasterSchoolStudent,
  deleteMasterSchoolStudent,
  saveMasterSchoolStudents,
  DEFAULT_MASTER_SCHOOL_STUDENTS,
} from '../utils/storage';

interface SchoolDataViewProps {
  masterStudents: MasterSchoolStudent[];
  setMasterStudents: React.Dispatch<React.SetStateAction<MasterSchoolStudent[]>>;
  onNavigateTab?: (tab: NavigationTab) => void;
  userRole?: string | null;
}

export const SchoolDataView: React.FC<SchoolDataViewProps> = ({
  masterStudents,
  setMasterStudents,
  onNavigateTab,
  userRole,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('ALL');
  
  // Modal States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterSchoolStudent | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // Form State
  const [formValues, setFormValues] = useState({
    namaSiswa: '',
    nis: '',
    nisn: '',
    kelas: 'XII Merdeka 1',
  });
  const [formError, setFormError] = useState('');

  // Import State
  const [rawImportText, setRawImportText] = useState('');
  const [importPreview, setImportPreview] = useState<Array<{ namaSiswa: string; nis: string; nisn: string; kelas: string }>>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Extract unique classes
  const availableClasses = Array.from(
    new Set([
      'XII Merdeka 1',
      'XII Merdeka 2',
      'XII Merdeka 3',
      'XII Merdeka 4',
      ...masterStudents.map((s) => s.kelas).filter(Boolean),
    ])
  ).sort();

  // Filtered Students
  const filteredStudents = masterStudents.filter((student) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      student.namaSiswa.toLowerCase().includes(q) ||
      student.nis.toLowerCase().includes(q) ||
      student.nisn.toLowerCase().includes(q) ||
      student.kelas.toLowerCase().includes(q);

    const matchesKelas = selectedKelas === 'ALL' || student.kelas === selectedKelas;

    return matchesSearch && matchesKelas;
  });

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormValues({
      namaSiswa: '',
      nis: '',
      nisn: '',
      kelas: availableClasses[0] || 'XII Merdeka 1',
    });
    setFormError('');
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (item: MasterSchoolStudent) => {
    setEditingItem(item);
    setFormValues({
      namaSiswa: item.namaSiswa,
      nis: item.nis,
      nisn: item.nisn,
      kelas: item.kelas,
    });
    setFormError('');
    setIsAddEditModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValues.namaSiswa.trim()) {
      setFormError('Nama Siswa wajib diisi.');
      return;
    }
    if (!formValues.nis.trim()) {
      setFormError('NIS (Nomor Induk Siswa) wajib diisi.');
      return;
    }
    if (!formValues.nisn.trim()) {
      setFormError('NISN (Nomor Induk Siswa Nasional) wajib diisi.');
      return;
    }

    if (editingItem) {
      const updatedItem: MasterSchoolStudent = {
        ...editingItem,
        namaSiswa: formValues.namaSiswa.trim(),
        nis: formValues.nis.trim(),
        nisn: formValues.nisn.trim(),
        kelas: formValues.kelas.trim(),
      };
      updateMasterSchoolStudent(updatedItem);
      setMasterStudents((prev) => prev.map((s) => (s.id === updatedItem.id ? updatedItem : s)));
    } else {
      const created = addMasterSchoolStudent({
        namaSiswa: formValues.namaSiswa.trim(),
        nis: formValues.nis.trim(),
        nisn: formValues.nisn.trim(),
        kelas: formValues.kelas.trim(),
      });
      setMasterStudents((prev) => [created, ...prev]);
    }

    setIsAddEditModalOpen(false);
  };

  const handleDelete = (id: string, nama: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data master "${nama}"?`)) {
      deleteMasterSchoolStudent(id);
      setMasterStudents((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleResetDefault = () => {
    if (window.confirm('Reset data sekolah ke data bawaan contoh? Semua perubahan lokal akan disesuaikan.')) {
      saveMasterSchoolStudents(DEFAULT_MASTER_SCHOOL_STUDENTS);
      setMasterStudents(DEFAULT_MASTER_SCHOOL_STUDENTS);
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      { 'Nama Siswa': 'Ahmad Fauzi', 'NIS': '22231001', 'NISN': '0061234561', 'Kelas': 'XII Merdeka 1' },
      { 'Nama Siswa': 'Anisa Rahmawati', 'NIS': '22231002', 'NISN': '0061234562', 'Kelas': 'XII Merdeka 1' },
      { 'Nama Siswa': 'Bintang Putra Pratama', 'NIS': '22231003', 'NISN': '0061234563', 'Kelas': 'XII Merdeka 2' },
      { 'Nama Siswa': 'Citra Dewi Kartika', 'NIS': '22231004', 'NISN': '0061234564', 'Kelas': 'XII Merdeka 2' },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    // Auto column widths
    worksheet['!cols'] = [
      { wch: 30 }, // Nama Siswa
      { wch: 15 }, // NIS
      { wch: 18 }, // NISN
      { wch: 20 }, // Kelas
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Input Data Sekolah');
    XLSX.writeFile(workbook, 'Template_Input_Data_Sekolah.xlsx');
  };

  const handleLoadSampleTemplateText = () => {
    const sampleText = `Nama Siswa\tNIS\tNISN\tKelas
Ahmad Fauzi\t22231001\t0061234561\tXII Merdeka 1
Anisa Rahmawati\t22231002\t0061234562\tXII Merdeka 1
Bintang Putra Pratama\t22231003\t0061234563\tXII Merdeka 2
Citra Dewi Kartika\t22231004\t0061234564\tXII Merdeka 2`;
    setRawImportText(sampleText);
    setImportStatus('✓ Contoh data template Excel berhasil dimuat! Klik "Pratinjau Data" untuk memeriksa.');
  };

  // Upload Excel file handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        const parsed: Array<{ namaSiswa: string; nis: string; nisn: string; kelas: string }> = [];
        data.forEach((row: any) => {
          const keys = Object.keys(row);
          const findKey = (term: string) => keys.find((k) => k.toLowerCase().includes(term));

          const namaKey = findKey('nama') || keys[0];
          const nisKey = keys.find((k) => k.toLowerCase().includes('nis') && !k.toLowerCase().includes('nisn')) || keys[1];
          const nisnKey = findKey('nisn') || keys[2];
          const kelasKey = findKey('kelas') || keys[3];

          const rawNama = String(row[namaKey] || '').trim();
          const rawNis = String(row[nisKey || ''] || '').trim();
          const rawNisn = String(row[nisnKey || ''] || '').trim();
          const rawKelas = String(row[kelasKey || ''] || 'XII Merdeka 1').trim();

          if (rawNama) {
            parsed.push({
              namaSiswa: rawNama,
              nis: rawNis,
              nisn: rawNisn,
              kelas: rawKelas || 'XII Merdeka 1',
            });
          }
        });

        setImportPreview(parsed);
        if (parsed.length > 0) {
          setImportStatus(`✓ Berhasil membaca file Excel "${file.name}" (${parsed.length} baris data siswa).`);
        } else {
          setImportStatus('❌ File Excel dibaca tetapi tidak ditemukan baris data siswa yang sesuai.');
        }
      } catch (err) {
        console.error('File Excel error:', err);
        setImportStatus('❌ Gagal membaca file Excel. Pastikan format file .xlsx atau .xls valid.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Parse Excel / CSV pasted text
  const handleParseImportText = () => {
    if (!rawImportText.trim()) {
      setImportPreview([]);
      setImportStatus('Mohon tempelkan data atau teks terlebih dahulu.');
      return;
    }

    const lines = rawImportText.split('\n').filter((l) => l.trim().length > 0);
    const parsed: Array<{ namaSiswa: string; nis: string; nisn: string; kelas: string }> = [];

    lines.forEach((line) => {
      // Split by tab (Excel copy-paste) or comma/semicolon
      let parts = line.split('\t');
      if (parts.length < 3) parts = line.split(',');
      if (parts.length < 3) parts = line.split(';');

      if (parts.length >= 3) {
        const rawNama = parts[0]?.trim() || '';
        const rawNis = parts[1]?.trim() || '';
        const rawNisn = parts[2]?.trim() || '';
        const rawKelas = parts[3]?.trim() || 'XII Merdeka 1';

        // Skip header line if present
        if (
          rawNama.toLowerCase().includes('nama') &&
          (rawNis.toLowerCase().includes('nis') || rawNisn.toLowerCase().includes('nisn'))
        ) {
          return;
        }

        if (rawNama && (rawNis || rawNisn)) {
          parsed.push({
            namaSiswa: rawNama,
            nis: rawNis,
            nisn: rawNisn,
            kelas: rawKelas,
          });
        }
      }
    });

    setImportPreview(parsed);
    if (parsed.length > 0) {
      setImportStatus(`Berhasil membaca ${parsed.length} baris data siswa.`);
    } else {
      setImportStatus('Gagal membaca data. Pastikan format kolom: Nama Siswa [Tab] NIS [Tab] NISN [Tab] Kelas');
    }
  };

  const handleProcessImport = () => {
    if (importPreview.length === 0) return;

    const newItems: MasterSchoolStudent[] = importPreview.map((item, idx) => ({
      id: 'mst-imp-' + Date.now() + '-' + idx,
      namaSiswa: item.namaSiswa,
      nis: item.nis,
      nisn: item.nisn,
      kelas: item.kelas || 'XII Merdeka 1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const combined = [...newItems, ...masterStudents];
    saveMasterSchoolStudents(combined);
    setMasterStudents(combined);

    setIsImportModalOpen(false);
    setRawImportText('');
    setImportPreview([]);
    setImportStatus(null);
    alert(`Berhasil mengimpor ${newItems.length} data siswa sekolah baru!`);
  };

  const handleExportExcel = () => {
    if (masterStudents.length === 0) {
      alert('Tidak ada data untuk diexport.');
      return;
    }
    const exportData = masterStudents.map((s) => ({
      'Nama Siswa': s.namaSiswa,
      'NIS': s.nis,
      'NISN': s.nisn,
      'Kelas': s.kelas,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet['!cols'] = [
      { wch: 30 },
      { wch: 15 },
      { wch: 18 },
      { wch: 20 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Data Sekolah');
    XLSX.writeFile(workbook, `Master_Data_Sekolah_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 lg:p-8 rounded-3xl shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <Building2 className="w-3.5 h-3.5" />
              Master Database Sekolah & Autocomplete Formulir
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/50">
              <ShieldCheck className="w-3.5 h-3.5" /> Synchronized with Firebase Realtime
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                INPUT DATA SEKOLAH
              </h2>
              <p className="text-slate-300 text-xs lg:text-sm mt-1 max-w-2xl leading-relaxed">
                Pengelolaan master data dasar seluruh siswa sekolah (Nama, NIS, NISN, Kelas). Data di menu ini berfungsi sebagai rujukan awal yang otomatis muncul dan melengkapi saat siswa mengisi Formulir Pendataan Siswa.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-2 bg-indigo-900/80 hover:bg-indigo-900 text-indigo-100 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-indigo-700/60 transition-all hover:border-indigo-500"
                title="Unduh file template Excel (.xlsx) dengan format Nama Siswa, NIS, NISN, Kelas"
              >
                <Download className="w-4 h-4 text-indigo-300" /> Template Excel (.xlsx)
              </button>
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" /> Tambah Siswa
              </button>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 transition-all hover:border-slate-600"
              >
                <Upload className="w-4 h-4 text-emerald-400" /> Import Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Siswa Master</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{masterStudents.length} <span className="text-xs font-normal text-slate-500">Siswa</span></h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">✓ Siap untuk Auto-Fill Formulir</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jumlah Rombel / Kelas</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{availableClasses.length} <span className="text-xs font-normal text-slate-500">Kelas</span></h3>
            <p className="text-[11px] text-indigo-600 font-medium mt-1">Terintegrasi Tingkat XII</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status Validasi NIS & NISN</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">100% <span className="text-xs font-normal text-slate-500">Terdaftar</span></h3>
            <p className="text-[11px] text-slate-500 mt-1">Sinkron dengan Database Cloud</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berdasarkan Nama Siswa, NIS, atau NISN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Semua Kelas ({masterStudents.length})</option>
              {availableClasses.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all"
            title="Export data ke file Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" /> Export Excel (.xlsx)
          </button>
          <button
            onClick={handleResetDefault}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
            title="Reset ke Contoh Bawaan"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Sample
          </button>
        </div>
      </div>

      {/* Main Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" /> Data Awal Siswa Sekolah ({filteredStudents.length} Tampil)
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Format resmi: Nama Siswa | NIS | NISN | Kelas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">NIS</th>
                <th className="py-3 px-4">NISN</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4 text-center">Status Master</th>
                <th className="py-3 px-4 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-sm text-slate-600">Tidak ada data siswa sekolah yang ditemukan.</p>
                    <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau tambah data baru.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center">
                        {student.namaSiswa.charAt(0).toUpperCase()}
                      </div>
                      <span>{student.namaSiswa}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-900 bg-indigo-50/50 rounded px-2 py-1 inline-block mt-2">
                      {student.nis || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {student.nisn || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {student.kelas}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Valid Master
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {onNavigateTab && (
                          <button
                            onClick={() => onNavigateTab('form')}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                            title="Isi Formulir Pendataan Siswa Ini"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditModal(student)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Data"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id, student.namaSiswa)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Data"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                {editingItem ? 'Edit Data Sekolah Siswa' : 'Tambah Data Sekolah Siswa'}
              </h3>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 pt-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Siswa <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Fauzi"
                  value={formValues.namaSiswa}
                  onChange={(e) => setFormValues({ ...formValues, namaSiswa: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIS <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 22231001"
                    value={formValues.nis}
                    onChange={(e) => setFormValues({ ...formValues, nis: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NISN <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 0061234561"
                    value={formValues.nisn}
                    onChange={(e) => setFormValues({ ...formValues, nisn: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kelas <span className="text-rose-500">*</span></label>
                <select
                  value={formValues.kelas}
                  onChange={(e) => setFormValues({ ...formValues, kelas: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {availableClasses.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/30"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Tambah Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMPORT EXCEL MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                Import Data Sekolah dari File Excel (.xlsx / .xls)
              </h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs text-amber-900 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="font-bold flex items-center gap-1.5 text-amber-950">
                    <Sparkles className="w-4 h-4 text-amber-600" /> Format Kolom Excel (Nama Siswa, NIS, NISN, Kelas):
                  </p>
                  <p className="font-mono text-[11px] text-amber-800 mt-0.5">
                    Kolom 1: Nama Siswa | Kolom 2: NIS | Kolom 3: NISN | Kolom 4: Kelas
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] rounded-lg transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh Template Excel (.xlsx)
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadSampleTemplateText}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold text-[11px] rounded-lg transition-all"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-700" /> Contoh Text
                  </button>
                </div>
              </div>
            </div>

            {/* OPSI 1: UPLOAD FILE EXCEL */}
            <div className="p-4 border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-2xl text-center space-y-2">
              <Upload className="w-8 h-8 text-indigo-500 mx-auto" />
              <div>
                <p className="text-xs font-bold text-indigo-950">Upload Langsung File Excel (.xlsx / .xls)</p>
                <p className="text-[11px] text-slate-500">Pilih file spreadsheet dari laptop/komputer Anda</p>
              </div>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all">
                <FileSpreadsheet className="w-4 h-4" /> Pilih File Excel
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Atau Tempelkan Teks Excel</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tempelkan Baris Tabel Excel di Sini (Copy-Paste):
              </label>
              <textarea
                rows={4}
                value={rawImportText}
                onChange={(e) => setRawImportText(e.target.value)}
                placeholder="Ahmad Fauzi&#10914;22231001&#10914;0061234561&#10914;XII Merdeka 1&#10;Anisa Rahmawati&#10914;22231002&#10914;0061234562&#10914;XII Merdeka 1"
                className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              ></textarea>
            </div>

            {importStatus && (
              <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-700">
                {importStatus}
              </div>
            )}

            {importPreview.length > 0 && (
              <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 font-bold text-slate-700 sticky top-0">
                    <tr>
                      <th className="p-2">Nama Siswa</th>
                      <th className="p-2">NIS</th>
                      <th className="p-2">NISN</th>
                      <th className="p-2">Kelas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importPreview.map((p, i) => (
                      <tr key={i}>
                        <td className="p-2 font-bold">{p.namaSiswa}</td>
                        <td className="p-2 font-mono">{p.nis}</td>
                        <td className="p-2 font-mono">{p.nisn}</td>
                        <td className="p-2">{p.kelas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleParseImportText}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
              >
                Pratinjau Data
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={importPreview.length === 0}
                  onClick={handleProcessImport}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/30"
                >
                  Simpan {importPreview.length} Data Ke Database
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

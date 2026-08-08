import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  UserPlus,
  Download,
  RotateCcw,
  BookOpen,
  GraduationCap,
  X,
  CheckCircle2,
  FileSpreadsheet,
  Upload,
  FileUp,
  Award
} from 'lucide-react';
import { Student } from '../types';
import { MAPEL_TKA_OPTIONS } from '../data/mockStudents';
import { exportStudentsToCSV } from '../utils/storage';
import { exportStudentsToExcel } from '../utils/excelUtils';
import { ImportExcelModal } from './ImportExcelModal';

interface StudentListProps {
  students: Student[];
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onSelectStudentDetail: (student: Student) => void;
  onAddNewStudent: () => void;
  onResetData: () => void;
  onRefreshData?: () => void;
  isReadOnly?: boolean;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  onEditStudent,
  onDeleteStudent,
  onSelectStudentDetail,
  onAddNewStudent,
  onResetData,
  onRefreshData,
  isReadOnly = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('ALL');
  const [selectedMapel, setSelectedMapel] = useState('ALL');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Extract unique kelas
  const kelasOptions = useMemo(() => {
    const list = Array.from(new Set(students.map((s) => s.kelas))).filter(Boolean);
    return ['ALL', ...list];
  }, [students]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        student.namaSiswa.toLowerCase().includes(q) ||
        student.nis.toLowerCase().includes(q) ||
        student.nisn.toLowerCase().includes(q) ||
        student.mapelTka1.toLowerCase().includes(q) ||
        student.mapelTka2.toLowerCase().includes(q) ||
        student.prodiPilihan1.toLowerCase().includes(q) ||
        student.prodiPilihan2.toLowerCase().includes(q);

      const matchesKelas = selectedKelas === 'ALL' || student.kelas === selectedKelas;

      const matchesMapel =
        selectedMapel === 'ALL' ||
        student.mapelTka1 === selectedMapel ||
        student.mapelTka2 === selectedMapel;

      return matchesSearch && matchesKelas && matchesMapel;
    });
  }, [students, searchQuery, selectedKelas, selectedMapel]);

  return (
    <div className="space-y-5">
      {/* Search & Filter Header Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Nama Siswa, NIS, NISN, Mapel TKA, atau Prodi..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {!isReadOnly && (
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                <FileUp className="w-3.5 h-3.5" />
                <span>Impor Data Excel</span>
              </button>
            )}

            <button
              onClick={() => {
                exportStudentsToExcel(filteredStudents);
                showToast(`Berhasil mengunduh ${filteredStudents.length} data siswa (.xlsx)`);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={() => {
                exportStudentsToCSV(filteredStudents);
                showToast(`Berhasil mengunduh ${filteredStudents.length} data siswa (.csv)`);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            {!isReadOnly && (
              <button
                onClick={onAddNewStudent}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Tambah Siswa</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>

            {/* Filter Kelas */}
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Semua Kelas ({kelasOptions.length - 1})</option>
              {kelasOptions
                .filter((k) => k !== 'ALL')
                .map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
            </select>

            {/* Filter Mapel TKA */}
            <select
              value={selectedMapel}
              onChange={(e) => setSelectedMapel(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Semua Mapel TKA</option>
              {MAPEL_TKA_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {(selectedKelas !== 'ALL' || selectedMapel !== 'ALL' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedKelas('ALL');
                  setSelectedMapel('ALL');
                  setSearchQuery('');
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 underline font-semibold ml-1"
              >
                Reset Filter
              </button>
            )}
          </div>

          <div className="text-slate-500 font-medium">
            Menampilkan <span className="font-bold text-slate-800">{filteredStudents.length}</span> dari {students.length} siswa
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-100 font-bold tracking-wider uppercase text-[11px]">
                <th className="p-3.5 pl-5">Nama Siswa</th>
                <th className="p-3.5">NIS / NISN</th>
                <th className="p-3.5">Mapel TKA 1-2</th>
                <th className="p-3.5">Studi Lanjut</th>
                <th className="p-3.5">Prodi Pilihan 1 & 2</th>
                <th className="p-3.5">Data Prestasi Siswa</th>
                <th className="p-3.5 text-center">Kelas</th>
                <th className="p-3.5 text-right pr-5">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-slate-400">
                    <p className="font-semibold text-sm mb-1">
                      Tidak ada data siswa ditemukan
                    </p>
                    <p className="text-xs">
                      Coba ubah kata kunci pencarian atau reset filter.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Nama Siswa */}
                    <td className="p-3.5 pl-5 font-bold text-slate-800 min-w-[160px]">
                      <div className="flex items-center gap-2">
                        {s.fotoSiswa ? (
                          <img
                            src={s.fotoSiswa}
                            alt={s.namaSiswa}
                            className="w-8 h-8 rounded-full object-cover border border-indigo-200 shrink-0 shadow-2xs"
                          />
                        ) : (
                          <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {s.namaSiswa.charAt(0)}
                          </span>
                        )}
                        <div>
                          <span className="block leading-tight text-slate-900">{s.namaSiswa}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {s.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* NIS / NISN */}
                    <td className="p-3.5 font-mono text-slate-700 font-medium">
                      <div className="text-xs">{s.nis}</div>
                      <div className="text-[10px] text-slate-400">{s.nisn}</div>
                    </td>

                    {/* Mapel TKA 1 & 2 */}
                    <td className="p-3.5">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-800 border border-indigo-200/60 px-2 py-0.5 rounded-md font-semibold text-[10px]">
                          1. {s.mapelTka1}
                        </span>
                        <br />
                        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-800 border border-purple-200/60 px-2 py-0.5 rounded-md font-semibold text-[10px]">
                          2. {s.mapelTka2}
                        </span>
                      </div>
                    </td>

                    {/* Studi Lanjut Badge */}
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                          s.pilihanStudiLanjut === 'AKADEMI'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : s.pilihanStudiLanjut === 'Bekerja'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {s.pilihanStudiLanjut || 'Kuliah'}
                      </span>
                    </td>

                    {/* Prodi & Universitas Pilihan 1 & 2 */}
                    <td className="p-3.5 font-medium text-slate-800 max-w-[220px]">
                      {s.pilihanStudiLanjut === 'Kuliah' || !s.pilihanStudiLanjut ? (
                        <div className="space-y-1">
                          <div className="text-[11px] font-semibold text-emerald-950 leading-tight" title={s.ptn1 ? `${s.ptn1} - ${s.prodiPilihan1}` : s.prodiPilihan1}>
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded mr-1">P1</span>
                            {s.ptn1 ? `${s.ptn1} - ${s.prodiPilihan1}` : s.prodiPilihan1}
                          </div>
                          <div className="text-[10px] text-slate-600 leading-tight" title={s.ptn2 ? `${s.ptn2} - ${s.prodiPilihan2}` : s.prodiPilihan2}>
                            <span className="text-[9px] font-bold text-teal-700 bg-teal-100/80 px-1.5 py-0.2 rounded mr-1">P2</span>
                            {s.ptn2 ? `${s.ptn2} - ${s.prodiPilihan2}` : s.prodiPilihan2}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">
                          Persiapan {s.pilihanStudiLanjut === 'AKADEMI' ? 'AKADEMI (TNI/Kedinasan)' : 'Dunia Kerja'}
                        </span>
                      )}
                    </td>

                    {/* Prestasi Dapodik */}
                    <td className="p-3.5">
                      {s.prestasiList && s.prestasiList.length > 0 ? (
                        <span
                          className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full font-bold text-[10px]"
                          title={s.prestasiList.map((p) => p.namaPrestasi).join(', ')}
                        >
                          <Award className="w-3 h-3 text-amber-600" />
                          {s.prestasiList.length} Sertifikat
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-normal">-</span>
                      )}
                    </td>

                    {/* Kelas */}
                    <td className="p-3.5 text-center">
                      <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[11px]">
                        {s.kelas}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right pr-5">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onSelectStudentDetail(s)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Lihat Detail Siswa"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!isReadOnly && (
                          <>
                            <button
                              onClick={() => onEditStudent(s)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Edit Data Siswa"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(s.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus Data Siswa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Format Isian Data Sesuai Standar Administrasi TKA & Studi Lanjut</span>
          </div>

          {!isReadOnly && (
            <button
              onClick={onResetData}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 underline font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset ke Data Contoh Bawaan
            </button>
          )}
        </div>
      </div>

      {/* Import Excel Modal */}
      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={(count) => {
          showToast(`Berhasil mengimpor ${count} data siswa dari file Excel/CSV!`);
          if (onRefreshData) onRefreshData();
        }}
      />

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs border border-slate-700 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <h3 className="text-base font-bold text-slate-800">
              Konfirmasi Hapus Siswa
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus data siswa ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteStudent(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

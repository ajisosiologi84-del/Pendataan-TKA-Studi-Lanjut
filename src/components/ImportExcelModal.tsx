import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  Info
} from 'lucide-react';
import { Student } from '../types';
import { downloadExcelTemplate, parseExcelFile } from '../utils/excelUtils';
import { addMultipleStudents, getAppsScriptUrl } from '../utils/storage';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedCount: number) => void;
}

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<Omit<Student, 'id' | 'updatedAt'>[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'overwrite'>('append');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile) return;

    // Check extension
    const name = selectedFile.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.csv')) {
      alert('Format file harus berupa Excel (.xlsx, .xls) atau CSV (.csv)');
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);
    setParseErrors([]);
    setParsedData([]);

    try {
      const { validStudents, errors } = await parseExcelFile(selectedFile);
      setParsedData(validStudents);
      setParseErrors(errors);
    } catch (err: any) {
      setParseErrors([err.message || 'Gagal memproses file Excel.']);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = async () => {
    if (parsedData.length === 0) return;

    setIsSubmitting(true);
    try {
      addMultipleStudents(parsedData, importMode);

      // Webhook sync to Google Apps Script if configured
      const gasUrl = getAppsScriptUrl();
      if (gasUrl) {
        try {
          await fetch(gasUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: 'batchSave', students: parsedData }),
          });
        } catch (gasErr) {
          console.warn('Apps script sync warning:', gasErr);
        }
      }

      onImportSuccess(parsedData.length);
      onClose();
    } catch (error) {
      alert('Terjadi kesalahan saat menyimpan data impor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setParseErrors([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600/90 text-white rounded-xl shadow-md">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Impor Data Siswa Excel / CSV
              </h3>
              <p className="text-xs text-indigo-200">
                Upload berkas spreadsheet untuk memasukkan data siswa secara masal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Step 1: Template Download */}
          <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-indigo-950 text-xs">
                  Belum Memiliki Format Excel?
                </h4>
                <p className="text-[11px] text-indigo-800/80 leading-relaxed">
                  Unduh template resmi agar tata letak kolom (Nama, NIS, NISN, Mapel TKA, Prodi) langsung sesuai.
                </p>
              </div>
            </div>

            <button
              onClick={downloadExcelTemplate}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0 inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh Template Excel (.xlsx)
            </button>
          </div>

          {/* Upload Area */}
          {!file ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-indigo-500 bg-indigo-50/50'
                  : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>

              <h4 className="font-bold text-slate-800 text-sm mb-1">
                Pilih atau Geser File Excel / CSV Ke Sini
              </h4>
              <p className="text-slate-500 text-xs mb-3">
                Mendukung format <strong className="text-slate-700">.XLSX</strong>,{' '}
                <strong className="text-slate-700">.XLS</strong>, dan{' '}
                <strong className="text-slate-700">.CSV</strong>
              </p>

              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs">
                Cari Berkas di Komputer
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* File Info Bar */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs truncate max-w-[250px]">
                      {file.name}
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB • {parsedData.length} baris data valid terdeteksi
                    </p>
                  </div>
                </div>

                <button
                  onClick={resetState}
                  className="px-2.5 py-1.5 text-[11px] text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg"
                >
                  Ganti File
                </button>
              </div>

              {/* Parsing Warnings / Errors */}
              {parseErrors.length > 0 && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Catatan Validasi Baris ({parseErrors.length}):</span>
                  </div>
                  <ul className="list-disc pl-5 text-amber-800 text-[11px] space-y-0.5 max-h-24 overflow-y-auto">
                    {parseErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mode Selection */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-800 text-xs block">
                  Metode Penambahan Data:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center space-x-2.5 ${
                      importMode === 'append'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="text-indigo-600"
                    />
                    <div>
                      <div className="text-xs">Tambahkan ke Data Ada</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        Siswa baru digabungkan dengan daftar saat ini
                      </div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center space-x-2.5 ${
                      importMode === 'overwrite'
                        ? 'bg-rose-50 border-rose-500 text-rose-950 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'overwrite'}
                      onChange={() => setImportMode('overwrite')}
                      className="text-rose-600"
                    />
                    <div>
                      <div className="text-xs text-rose-900">Timpa Semua Data</div>
                      <div className="text-[10px] text-rose-600/80 font-normal">
                        Menghapus data lama & mengganti penuh dari Excel
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Preview Table */}
              <div className="space-y-2">
                <h5 className="font-bold text-slate-800 text-xs flex items-center justify-between">
                  <span>Pratinjau Data Siswa Terdeteksi ({parsedData.length})</span>
                  <span className="text-slate-400 font-normal text-[10px]">
                    Menampilkan maksimal 5 baris pertama
                  </span>
                </h5>

                <div className="border border-slate-200 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-2 pl-3">Nama Siswa</th>
                        <th className="p-2">NIS / NISN</th>
                        <th className="p-2">Kelas</th>
                        <th className="p-2">Mapel TKA 1-2</th>
                        <th className="p-2">Prodi 1-2</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedData.slice(0, 5).map((s, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 pl-3 font-semibold text-slate-800">
                            {s.namaSiswa}
                          </td>
                          <td className="p-2 font-mono text-slate-600">
                            {s.nis} / {s.nisn}
                          </td>
                          <td className="p-2 text-slate-600">{s.kelas}</td>
                          <td className="p-2 text-indigo-700 font-medium">
                            {s.mapelTka1}, {s.mapelTka2}
                          </td>
                          <td className="p-2 text-slate-700 truncate max-w-[150px]">
                            {s.prodiPilihan1}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 rounded-xl border border-slate-200"
          >
            Batal
          </button>

          {parsedData.length > 0 && (
            <button
              onClick={handleConfirmImport}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Memproses...'
                  : `Proses Impor ${parsedData.length} Siswa`}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

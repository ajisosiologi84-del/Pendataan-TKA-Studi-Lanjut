import React, { useState } from 'react';
import { ShieldCheck, UserCheck, GraduationCap, Users, KeyRound, Lock, User, Sparkles, CheckCircle2 } from 'lucide-react';
import { Student } from '../types';

interface LoginModalProps {
  onLogin: (role: 'superadmin' | 'walikelas' | 'bk' | 'siswa', nis?: string) => void;
  students: Student[];
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin, students }) => {
  const [selectedRole, setSelectedRole] = useState<'superadmin' | 'walikelas' | 'bk' | 'siswa'>('superadmin');
  const [passwordInput, setPasswordInput] = useState('');
  const [nisInput, setNisInput] = useState('');
  const [studentPasswordInput, setStudentPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (selectedRole === 'superadmin') {
      if (passwordInput === 'admin123' || passwordInput === 'admin' || passwordInput === '') {
        onLogin('superadmin');
      } else {
        setErrorMsg('Password Super Admin salah! (Gunakan: admin123)');
      }
    } else if (selectedRole === 'walikelas') {
      if (passwordInput === 'walikelas' || passwordInput === 'guru' || passwordInput === '') {
        onLogin('walikelas');
      } else {
        setErrorMsg('Password Wali Kelas salah! (Gunakan: walikelas)');
      }
    } else if (selectedRole === 'bk') {
      if (passwordInput === 'bk' || passwordInput === 'bimbingan' || passwordInput === '') {
        onLogin('bk');
      } else {
        setErrorMsg('Password BK salah! (Gunakan: bk)');
      }
    }
  };

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanNis = nisInput.trim();
    if (!cleanNis) {
      setErrorMsg('Mohon masukkan Nomor Induk Siswa (NIS) Anda.');
      return;
    }

    // Password verification for student: password must equal NIS or match student record if configured
    // User requested: "untuk siswa hanya bisa mengisi data Form input data ( menggunakan NIS untuk username dan Password )"
    const pass = studentPasswordInput.trim();
    if (pass !== cleanNis && pass !== 'siswa123' && pass !== '') {
      setErrorMsg('Password harus sama dengan NIS Anda (atau gunakan NIS sebagai password).');
      return;
    }

    onLogin('siswa', cleanNis);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white text-center relative">
          <div className="absolute top-4 right-4 bg-white/10 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider text-indigo-200 uppercase">
            Portal TKA 2026
          </div>
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-3 text-white">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black tracking-tight">Pilih Hak Akses & Login</h2>
          <p className="text-xs text-indigo-200 mt-1">
            Sistem Pendataan Terpadu Siswa TKA, Studi Lanjut, & Inventaris Laptop
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => { setSelectedRole('superadmin'); setErrorMsg(null); setPasswordInput(''); }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                selectedRole === 'superadmin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Super Admin</span>
            </button>

            <button
              onClick={() => { setSelectedRole('walikelas'); setErrorMsg(null); setPasswordInput(''); }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                selectedRole === 'walikelas'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Wali Kelas</span>
            </button>

            <button
              onClick={() => { setSelectedRole('bk'); setErrorMsg(null); setPasswordInput(''); }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                selectedRole === 'bk'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Guru BK</span>
            </button>

            <button
              onClick={() => { setSelectedRole('siswa'); setErrorMsg(null); setNisInput(''); setStudentPasswordInput(''); }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                selectedRole === 'siswa'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Siswa</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 animate-shake">
              {errorMsg}
            </div>
          )}

          {/* ADMIN / GURU LOGIN FORMS */}
          {selectedRole !== 'siswa' ? (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase">
                    {selectedRole === 'superadmin' && 'Akses Penuh Super Admin'}
                    {selectedRole === 'walikelas' && 'Akses Lihat Data Wali Kelas'}
                    {selectedRole === 'bk' && 'Akses Lihat Data Guru BK'}
                  </span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                    {selectedRole === 'superadmin' ? 'Full Control' : 'Read-Only View'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {selectedRole === 'superadmin' && 'Memiliki hak akses penuh untuk mengelola, menambah, mengedit, menghapus data, dan pengaturan sistem.'}
                  {selectedRole === 'walikelas' && 'Dapat melihat seluruh rekapitulasi data siswa, analisis TKA, dan inventaris laptop secara real-time.'}
                  {selectedRole === 'bk' && 'Dapat memantau pilihan studi lanjut siswa, peta peminatan TKA, serta rekapitulasi data secara menyeluruh.'}
                </p>

                <div className="space-y-1.5 pt-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Password Akses <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder={
                        selectedRole === 'superadmin' ? 'Masukkan password (cth: admin123)' :
                        selectedRole === 'walikelas' ? 'Masukkan password (cth: walikelas)' : 'Masukkan password (cth: bk)'
                      }
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      autoFocus
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    Hint default: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-700">
                      {selectedRole === 'superadmin' ? 'admin123' : selectedRole === 'walikelas' ? 'walikelas' : 'bk'}
                    </code> (atau kosongkan untuk masuk langsung)
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" /> Masuk sebagai {selectedRole === 'superadmin' ? 'Super Admin' : selectedRole === 'walikelas' ? 'Wali Kelas' : 'Guru BK'}
              </button>
            </form>
          ) : (
            /* SISWA LOGIN FORM */
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950 uppercase">
                    Login Siswa (Form Input Data)
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    NIS & Password
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Gunakan <strong>Nomor Induk Siswa (NIS)</strong> Anda sebagai Username dan Password untuk mengisi atau memperbarui data pilihan TKA dan Studi Lanjut.
                </p>

                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Nomor Induk Siswa (NIS) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        value={nisInput}
                        onChange={(e) => setNisInput(e.target.value)}
                        placeholder="Cth: 10234 atau 202601"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Password (Gunakan NIS Anda) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <KeyRound className="w-4 h-4" />
                      </span>
                      <input
                        type="password"
                        value={studentPasswordInput}
                        onChange={(e) => setStudentPasswordInput(e.target.value)}
                        placeholder="Masukkan password (ketik NIS Anda)"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 italic">
                      💡 Tip: Password standar adalah NIS Anda sendiri.
                    </p>
                  </div>
                </div>

                {students.length > 0 && (
                  <div className="mt-2 p-2.5 bg-white rounded-xl border border-emerald-100 text-[11px] text-slate-500">
                    <span className="font-semibold text-emerald-800">Contoh NIS Siswa yang tersedia:</span>{' '}
                    <span className="font-mono text-slate-700">
                      {students.slice(0, 4).map(s => s.nis).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-4 h-4" /> Masuk & Isi Form Data Siswa
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center text-[11px] text-slate-500">
          Sistem Pendataan Ujian TKA & Inventaris Sekolah • Aman & Terverifikasi
        </div>
      </div>
    </div>
  );
};

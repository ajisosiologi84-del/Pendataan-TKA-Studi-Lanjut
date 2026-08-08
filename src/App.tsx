import React, { useState, useEffect } from 'react';
import { NavigationTab, Student, LaptopData, ProktorTeknisi, DocumentSettings } from './types';
import {
  getStoredStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  resetToDefaultData,
  getAppsScriptUrl,
  saveAppsScriptUrl,
  getStoredLaptops,
  addLaptop,
  updateLaptop,
  deleteLaptop,
  resetLaptopsData,
  getStoredProktorTeknisi,
  addProktorTeknisi,
  updateProktorTeknisi,
  deleteProktorTeknisi,
  getStoredDocSettings,
  saveDocSettings,
  DEFAULT_DOCUMENT_SETTINGS
} from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { StudentList } from './components/StudentList';
import { StudentFormView } from './components/StudentFormView';
import { TkaAnalysisView } from './components/TkaAnalysisView';
import { AppsScriptView } from './components/AppsScriptView';
import { LaptopInventoryView } from './components/LaptopInventoryView';
import { SettingsView } from './components/SettingsView';
import { BanPtDirectoryView } from './components/BanPtDirectoryView';
import { MapelPilihanView } from './components/MapelPilihanView';
import { StudentDetailModal } from './components/StudentDetailModal';
import { LoginModal } from './components/LoginModal';

export default function App() {
  const [userRole, setUserRole] = useState<'superadmin' | 'walikelas' | 'bk' | 'siswa' | null>(null);
  const [currentUserNis, setCurrentUserNis] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [laptops, setLaptops] = useState<LaptopData[]>([]);
  const [proktorList, setProktorList] = useState<ProktorTeknisi[]>([]);
  const [docSettings, setDocSettings] = useState<DocumentSettings>(DEFAULT_DOCUMENT_SETTINGS);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [appsScriptUrl, setAppsScriptUrl] = useState('');

  // Initial load
  useEffect(() => {
    const list = getStoredStudents();
    setStudents(list);
    setLaptops(getStoredLaptops());
    setProktorList(getStoredProktorTeknisi());
    setDocSettings(getStoredDocSettings());
    setAppsScriptUrl(getAppsScriptUrl());
  }, []);

  const handleLogin = (role: 'superadmin' | 'walikelas' | 'bk' | 'siswa', nis?: string) => {
    setUserRole(role);
    if (role === 'siswa' && nis) {
      setCurrentUserNis(nis);
      const list = getStoredStudents();
      const found = list.find((s) => s.nis === nis);
      if (found) {
        setEditingStudent(found);
      } else {
        setEditingStudent({
          id: '',
          namaSiswa: '',
          nis: nis,
          nisn: '',
          kelas: 'XII Merdeka 1',
          jenisKelamin: 'L',
          mapelTka1: 'Matematika',
          mapelTka2: 'Fisika',
          pilihanStudiLanjut: 'Kuliah',
          prodiPilihan1: '',
          prodiPilihan2: '',
          updatedAt: new Date().toISOString()
        });
      }
      setActiveTab('form');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentUserNis(null);
    setEditingStudent(null);
    setActiveTab('dashboard');
  };

  // Laptop handlers
  const handleAddLaptop = (data: Omit<LaptopData, 'id' | 'updatedAt'>) => {
    if (userRole === 'walikelas' || userRole === 'bk') {
      alert('Akses ditolak: Wali Kelas dan Guru BK memiliki hak akses baca (read-only).');
      return;
    }
    addLaptop(data);
    setLaptops(getStoredLaptops());
  };

  const handleUpdateLaptop = (data: LaptopData) => {
    if (userRole === 'walikelas' || userRole === 'bk') {
      alert('Akses ditolak: Wali Kelas dan Guru BK memiliki hak akses baca (read-only).');
      return;
    }
    updateLaptop(data);
    setLaptops(getStoredLaptops());
  };

  const handleDeleteLaptop = (id: string) => {
    if (userRole === 'walikelas' || userRole === 'bk') {
      alert('Akses ditolak: Wali Kelas dan Guru BK memiliki hak akses baca (read-only).');
      return;
    }
    deleteLaptop(id);
    setLaptops(getStoredLaptops());
  };

  const handleResetLaptops = () => {
    if (userRole === 'walikelas' || userRole === 'bk') return;
    const resetList = resetLaptopsData();
    setLaptops(resetList);
  };

  // Proktor / Teknisi handlers
  const handleAddProktor = (data: Omit<ProktorTeknisi, 'id'>) => {
    if (userRole === 'walikelas' || userRole === 'bk') return;
    addProktorTeknisi(data);
    setProktorList(getStoredProktorTeknisi());
  };

  const handleUpdateProktor = (data: ProktorTeknisi) => {
    if (userRole === 'walikelas' || userRole === 'bk') return;
    updateProktorTeknisi(data);
    setProktorList(getStoredProktorTeknisi());
  };

  const handleDeleteProktor = (id: string) => {
    if (userRole === 'walikelas' || userRole === 'bk') return;
    deleteProktorTeknisi(id);
    setProktorList(getStoredProktorTeknisi());
  };

  // Doc Settings handlers
  const handleSaveDocSettings = (settings: DocumentSettings) => {
    if (userRole !== 'superadmin') return;
    saveDocSettings(settings);
    setDocSettings(settings);
  };

  const handleResetDocSettings = () => {
    if (userRole !== 'superadmin') return;
    saveDocSettings(DEFAULT_DOCUMENT_SETTINGS);
    setDocSettings(DEFAULT_DOCUMENT_SETTINGS);
  };

  // Save / Update Student handler
  const handleSaveStudent = (data: Omit<Student, 'id' | 'updatedAt'> | Student) => {
    if (userRole === 'walikelas' || userRole === 'bk') {
      alert('Akses ditolak: Wali Kelas dan Guru BK memiliki hak akses lihat (read-only).');
      return;
    }

    if (userRole === 'siswa' && currentUserNis) {
      const list = getStoredStudents();
      const existing = list.find((s) => s.nis === currentUserNis);
      const payload = { ...data, nis: currentUserNis };
      if (existing) {
        updateStudent({ ...existing, ...payload } as Student);
      } else {
        addStudent(payload);
      }
      alert('Data Formulir Anda Berhasil Disimpan!');
      const refreshed = getStoredStudents();
      setStudents(refreshed);
      const updatedCurrent = refreshed.find(s => s.nis === currentUserNis);
      if (updatedCurrent) setEditingStudent(updatedCurrent);
      return;
    }

    if ('id' in data && data.id) {
      updateStudent(data as Student);
    } else {
      addStudent(data);
    }
    const refreshed = getStoredStudents();
    setStudents(refreshed);
    setEditingStudent(null);
    setActiveTab('students');
  };

  // Delete Student handler
  const handleDeleteStudent = (id: string) => {
    if (userRole === 'walikelas' || userRole === 'bk') {
      alert('Akses ditolak: Wali Kelas dan Guru BK memiliki hak akses lihat (read-only).');
      return;
    }
    deleteStudent(id);
    const refreshed = getStoredStudents();
    setStudents(refreshed);
    if (detailStudent?.id === id) {
      setDetailStudent(null);
    }
  };

  // Reset to default sample students
  const handleResetData = () => {
    if (userRole !== 'superadmin') return;
    if (window.confirm('Apakah Anda yakin ingin mengembalikan data ke contoh bawaan awal?')) {
      const defaultList = resetToDefaultData();
      setStudents(defaultList);
    }
  };

  // Edit action from list or detail modal
  const handleSelectEdit = (student: Student) => {
    if (userRole === 'walikelas' || userRole === 'bk') {
      alert('Wali Kelas dan Guru BK hanya memiliki akses melihat data.');
      return;
    }
    setEditingStudent(student);
    setActiveTab('form');
  };

  // Refresh trigger
  const handleRefreshData = () => {
    const refreshed = getStoredStudents();
    setStudents(refreshed);
    setLaptops(getStoredLaptops());
    setProktorList(getStoredProktorTeknisi());
    setDocSettings(getStoredDocSettings());
    setAppsScriptUrl(getAppsScriptUrl());
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex">
      {!userRole && (
        <LoginModal onLogin={handleLogin} students={students} />
      )}

      {/* Left Sidebar Menu Layout */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (userRole === 'siswa' && tab !== 'form' && tab !== 'banpt' && tab !== 'mapelPilihan') {
            alert('Siswa hanya dapat mengakses formulir pengisian data, Direktori BAN-PT, dan Mata Pelajaran Pilihan.');
            return;
          }
          if ((userRole === 'walikelas' || userRole === 'bk') && (tab === 'form' || tab === 'appscript' || tab === 'settings')) {
            alert('Wali Kelas dan Guru BK tidak memiliki akses ke menu ini.');
            return;
          }
          setActiveTab(tab);
          if (tab !== 'form') setEditingStudent(null);
        }}
        totalStudents={students.length}
        appsScriptUrl={appsScriptUrl}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        userRole={userRole}
        currentUserNis={currentUserNis}
        onLogout={handleLogout}
      />

      {/* Main Content Area right of left sidebar */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 transition-all">
        {/* Top Header Bar */}
        <Header
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (userRole === 'siswa' && tab !== 'form') return;
            setActiveTab(tab);
            if (tab !== 'form') setEditingStudent(null);
          }}
          students={students}
          setIsMobileOpen={setIsMobileOpen}
          onRefreshData={handleRefreshData}
        />

        {/* Dynamic View Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && userRole !== 'siswa' && (
            <DashboardView
              students={students}
              setActiveTab={setActiveTab}
              onSelectStudentDetail={setDetailStudent}
            />
          )}

          {activeTab === 'students' && userRole !== 'siswa' && (
            <StudentList
              students={students}
              onEditStudent={handleSelectEdit}
              onDeleteStudent={handleDeleteStudent}
              onSelectStudentDetail={setDetailStudent}
              onAddNewStudent={() => {
                if (userRole === 'walikelas' || userRole === 'bk') return;
                setEditingStudent(null);
                setActiveTab('form');
              }}
              onResetData={handleResetData}
              onRefreshData={handleRefreshData}
              isReadOnly={userRole === 'walikelas' || userRole === 'bk'}
            />
          )}

          {activeTab === 'form' && (
            <StudentFormView
              editingStudent={editingStudent}
              onSaveStudent={handleSaveStudent}
              onCancel={() => {
                if (userRole === 'siswa') {
                  alert('Anda masuk sebagai Siswa. Untuk keluar, gunakan tombol Ganti Akun di sidebar.');
                  return;
                }
                setEditingStudent(null);
                setActiveTab('students');
              }}
            />
          )}

          {activeTab === 'analysis' && userRole !== 'siswa' && <TkaAnalysisView students={students} />}

          {activeTab === 'laptop' && userRole !== 'siswa' && (
            <LaptopInventoryView
              students={students}
              laptops={laptops}
              proktorList={proktorList}
              docSettings={docSettings}
              onAddLaptop={handleAddLaptop}
              onUpdateLaptop={handleUpdateLaptop}
              onDeleteLaptop={handleDeleteLaptop}
              onResetLaptops={handleResetLaptops}
              onAddProktor={handleAddProktor}
              onUpdateProktor={handleUpdateProktor}
              onDeleteProktor={handleDeleteProktor}
              onSaveDocSettings={handleSaveDocSettings}
              onResetDocSettings={handleResetDocSettings}
            />
          )}

          {activeTab === 'appscript' && userRole === 'superadmin' && <AppsScriptView />}

          {activeTab === 'settings' && userRole === 'superadmin' && (
            <SettingsView
              docSettings={docSettings}
              onSaveDocSettings={handleSaveDocSettings}
              onResetDocSettings={handleResetDocSettings}
              proktorList={proktorList}
              onAddProktor={handleAddProktor}
              onUpdateProktor={handleUpdateProktor}
              onDeleteProktor={handleDeleteProktor}
              appsScriptUrl={appsScriptUrl}
              onSaveAppsScriptUrl={(url) => {
                saveAppsScriptUrl(url);
                setAppsScriptUrl(url);
              }}
              onResetStudentsData={() => {
                const refreshed = resetToDefaultData();
                setStudents(refreshed);
              }}
              onResetLaptopsData={handleResetLaptops}
              totalStudents={students.length}
              totalLaptops={laptops.length}
              onDataRestored={() => {
                setStudents(getStoredStudents());
                setLaptops(getStoredLaptops());
                setProktorList(getStoredProktorTeknisi());
                setDocSettings(getStoredDocSettings());
                setAppsScriptUrl(getAppsScriptUrl());
              }}
            />
          )}

          {activeTab === 'banpt' && <BanPtDirectoryView />}

          {activeTab === 'mapelPilihan' && <MapelPilihanView userRole={userRole} />}
        </main>
      </div>

      {/* Student Detail Modal */}
      <StudentDetailModal
        student={detailStudent}
        onClose={() => setDetailStudent(null)}
        onEdit={handleSelectEdit}
      />
    </div>
  );
}

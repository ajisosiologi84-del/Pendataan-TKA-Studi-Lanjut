import React, { useState, useEffect, useRef } from 'react';
import { NavigationTab, Student, LaptopData, ProktorTeknisi, DocumentSettings } from './types';
import {
  getStoredStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  resetToDefaultData,
  clearAllStudentsData,
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
  DEFAULT_DOCUMENT_SETTINGS,
  addSecurityLog,
  saveStudents,
  saveLaptops,
  saveProktorTeknisi,
  saveSystemPasswords,
  saveCustomUsers,
  saveRolePermissions,
  saveSecurityPolicy,
  getStoredStudentFormAccess,
  saveStudentFormAccess,
} from './utils/storage';
import {
  subscribeStudentsFromFirestore,
  syncStudentToFirestore,
  deleteStudentFromFirestore,
  fetchSystemSettingsFromFirestore,
  subscribeSystemSettingFromFirestore
} from './firebase';
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
import { SnbpCalculatorView } from './components/SnbpCalculatorView';
import { StudentDetailModal } from './components/StudentDetailModal';
import { LoginModal } from './components/LoginModal';

export default function App() {
  const [userRole, setUserRole] = useState<'superadmin' | 'walikelas' | 'bk' | 'proktor' | 'siswa' | null>(null);
  const [currentUserNis, setCurrentUserNis] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [laptops, setLaptops] = useState<LaptopData[]>([]);
  const [proktorList, setProktorList] = useState<ProktorTeknisi[]>([]);
  const [docSettings, setDocSettings] = useState<DocumentSettings>(DEFAULT_DOCUMENT_SETTINGS);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [appsScriptUrl, setAppsScriptUrl] = useState('');
  const [isStudentFormOpen, setIsStudentFormOpen] = useState<boolean>(() => getStoredStudentFormAccess());
  const [pendingBanPtSelection, setPendingBanPtSelection] = useState<{
    targetChoice: 'pilihan1' | 'pilihan2';
    ptn: string;
    prodi: string;
    akreditasi?: string;
  } | null>(null);

  const syncFromGoogleSheets = async (urlOverride?: string): Promise<boolean> => {
    const url = urlOverride || appsScriptUrl || getAppsScriptUrl();
    if (!url) return false;

    try {
      let json: any = null;
      try {
        // Try POST with action 'getAll' first (most compatible across browser CORS modes)
        const postRes = await fetch(url.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ action: 'getAll' }),
        });
        json = await postRes.json();
      } catch (postErr) {
        // Fallback to GET request
        const getRes = await fetch(url.trim(), { method: 'GET' });
        json = await getRes.json();
      }

      if (json && json.status === 'success') {
        if (json.laptops && Array.isArray(json.laptops) && json.laptops.length > 0) {
          saveLaptops(json.laptops);
          setLaptops(json.laptops);
        }
        if (json.proktorList && Array.isArray(json.proktorList) && json.proktorList.length > 0) {
          saveProktorTeknisi(json.proktorList);
          setProktorList(json.proktorList);
        }
        const studentData = json.students || json.data;
        if (studentData && Array.isArray(studentData) && studentData.length > 0) {
          const cleanStudents = studentData.filter(
            (s: any) => s && s.id && !/^std-1[0-2][0-9]$/.test(s.id) && s.id !== 'std-101'
          );
          saveStudents(cleanStudents);
          setStudents(cleanStudents);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Sync from Google Sheets error:', err);
      return false;
    }
  };

  // Initial load & Firestore Realtime Sync & Auto Sync Google Sheets
  useEffect(() => {
    const localList = getStoredStudents();
    setStudents(localList);
    setLaptops(getStoredLaptops());
    setProktorList(getStoredProktorTeknisi());
    setDocSettings(getStoredDocSettings());
    const gasUrl = getAppsScriptUrl();
    setAppsScriptUrl(gasUrl);
    if (gasUrl) {
      syncFromGoogleSheets(gasUrl);
    }

    // Sync system settings (passwords, users, permissions, policy) from Firebase Firestore
    fetchSystemSettingsFromFirestore('passwords').then((remotePass) => {
      if (remotePass) saveSystemPasswords(remotePass, false);
    });
    fetchSystemSettingsFromFirestore('customUsers').then((remoteUsers) => {
      if (remoteUsers) saveCustomUsers(remoteUsers, false);
    });
    fetchSystemSettingsFromFirestore('rolePermissions').then((remoteMatrix) => {
      if (remoteMatrix) saveRolePermissions(remoteMatrix, false);
    });
    fetchSystemSettingsFromFirestore('securityPolicy').then((remotePolicy) => {
      if (remotePolicy) saveSecurityPolicy(remotePolicy, false);
    });

    // Real-time listener for Google Apps Script Web App URL across ALL devices (Laptop, Tablet, Mobile)
    const unsubscribeGasUrl = subscribeSystemSettingFromFirestore('appsScriptUrl', (remoteGasUrl) => {
      if (typeof remoteGasUrl === 'string' && remoteGasUrl.trim()) {
        const cleanRemoteUrl = remoteGasUrl.trim();
        setAppsScriptUrl(cleanRemoteUrl);
        saveAppsScriptUrl(cleanRemoteUrl, false);
        syncFromGoogleSheets(cleanRemoteUrl);
      }
    });

    // Real-time listener for Student Form Access Status (Open/Closed) across devices
    const unsubscribeFormAccess = subscribeSystemSettingFromFirestore('studentFormAccess', (remoteAccess) => {
      if (typeof remoteAccess === 'boolean') {
        setIsStudentFormOpen(remoteAccess);
        saveStudentFormAccess(remoteAccess, false);
      }
    });

    // Subscribe to Firestore students collection changes
    const unsubscribeStudents = subscribeStudentsFromFirestore((remoteStudents) => {
      if (remoteStudents && remoteStudents.length > 0) {
        const cleanRemote = remoteStudents.filter(
          (s: any) => s && s.id && !/^std-1[0-2][0-9]$/.test(s.id) && s.id !== 'std-101'
        );
        setStudents(cleanRemote);
        saveStudents(cleanRemote);
      } else {
        const cleanLocal = getStoredStudents().filter(
          (s) => s && s.id && !/^std-1[0-2][0-9]$/.test(s.id) && s.id !== 'std-101'
        );
        setStudents(cleanLocal);
        saveStudents(cleanLocal);
      }
    });

    // Auto sync with Google Sheets periodically (every 30 seconds) & on window focus
    const intervalId = setInterval(() => {
      const currentUrl = getAppsScriptUrl();
      if (currentUrl) {
        syncFromGoogleSheets(currentUrl);
      }
    }, 30000);

    const handleFocus = () => {
      const currentGasUrl = getAppsScriptUrl();
      if (currentGasUrl) {
        syncFromGoogleSheets(currentGasUrl);
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      unsubscribeGasUrl();
      unsubscribeStudents();
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Inactivity Auto-Logout Timeout (15 minutes = 900 seconds)
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!userRole) return;

    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = setTimeout(() => {
        addSecurityLog({
          role: userRole || 'UNKNOWN',
          userIdentifier: currentUserNis || undefined,
          action: 'AUTO_LOGOUT',
          category: 'AUTH',
          status: 'WARNING',
          details: `Sesi berakhir otomatis (Idle 15 menit tanpa aktivitas)`,
        });
        setUserRole(null);
        setCurrentUserNis(null);
        setEditingStudent(null);
        setActiveTab('dashboard');
        alert('🔒 Sesi Anda telah berakhir secara otomatis demi keamanan karena tidak ada aktivitas selama 15 menit.');
      }, 15 * 60 * 1000); // 15 minutes
    };

    // Event listeners to detect activity
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    activityEvents.forEach((evt) => window.addEventListener(evt, resetInactivityTimer));

    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      activityEvents.forEach((evt) => window.removeEventListener(evt, resetInactivityTimer));
    };
  }, [userRole, currentUserNis]);

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
    if (userRole) {
      addSecurityLog({
        role: userRole,
        userIdentifier: currentUserNis || undefined,
        action: 'LOGOUT',
        category: 'AUTH',
        status: 'SUCCESS',
        details: `Pengguna keluar (Logout) dari sistem`,
      });
    }
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
    const newLaptop = addLaptop(data);
    setLaptops(getStoredLaptops());

    if (appsScriptUrl) {
      try {
        fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ target: 'laptop', action: 'saveLaptop', laptop: newLaptop }),
        }).catch((err) => console.log('Apps Script Laptop sync note:', err));
      } catch (err) {}
    }
  };

  const handleUpdateLaptop = (data: LaptopData) => {
    if (userRole === 'walikelas' || userRole === 'bk') {
      alert('Akses ditolak: Wali Kelas dan Guru BK memiliki hak akses baca (read-only).');
      return;
    }
    updateLaptop(data);
    setLaptops(getStoredLaptops());

    if (appsScriptUrl) {
      try {
        fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ target: 'laptop', action: 'saveLaptop', laptop: data }),
        }).catch((err) => console.log('Apps Script Laptop sync note:', err));
      } catch (err) {}
    }
  };

  const handleDeleteLaptop = (id: string) => {
    if (userRole === 'walikelas' || userRole === 'bk') {
      alert('Akses ditolak: Wali Kelas dan Guru BK memiliki hak akses baca (read-only).');
      return;
    }
    deleteLaptop(id);
    setLaptops(getStoredLaptops());

    if (appsScriptUrl) {
      try {
        fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ target: 'laptop', action: 'deleteLaptop', id }),
        }).catch((err) => console.log('Apps Script Laptop sync note:', err));
      } catch (err) {}
    }
  };

  const handleResetLaptops = () => {
    if (userRole === 'walikelas' || userRole === 'bk') return;
    const resetList = resetLaptopsData();
    setLaptops(resetList);
  };

  // Proktor / Teknisi handlers
  const handleAddProktor = (data: Omit<ProktorTeknisi, 'id'>) => {
    if (userRole === 'walikelas' || userRole === 'bk') return;
    const newProktor = addProktorTeknisi(data);
    setProktorList(getStoredProktorTeknisi());

    if (appsScriptUrl) {
      try {
        fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ target: 'proktor', action: 'saveProktor', proktor: newProktor }),
        }).catch((err) => console.log('Apps Script Proktor sync note:', err));
      } catch (err) {}
    }
  };

  const handleUpdateProktor = (data: ProktorTeknisi) => {
    if (userRole === 'walikelas' || userRole === 'bk') return;
    updateProktorTeknisi(data);
    setProktorList(getStoredProktorTeknisi());

    if (appsScriptUrl) {
      try {
        fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ target: 'proktor', action: 'saveProktor', proktor: data }),
        }).catch((err) => console.log('Apps Script Proktor sync note:', err));
      } catch (err) {}
    }
  };

  const handleDeleteProktor = (id: string) => {
    if (userRole === 'walikelas' || userRole === 'bk') return;
    deleteProktorTeknisi(id);
    setProktorList(getStoredProktorTeknisi());

    if (appsScriptUrl) {
      try {
        fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ target: 'proktor', action: 'deleteProktor', id }),
        }).catch((err) => console.log('Apps Script Proktor sync note:', err));
      } catch (err) {}
    }
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

    let savedStudentObj: Student;

    if (userRole === 'siswa' && currentUserNis) {
      const list = getStoredStudents();
      const existing = list.find((s) => s.nis === currentUserNis);
      const payload = { ...data, nis: currentUserNis };
      if (existing) {
        savedStudentObj = { ...existing, ...payload } as Student;
        updateStudent(savedStudentObj);
      } else {
        const newObj: Student = {
          id: 'std-' + Date.now(),
          ...payload,
          updatedAt: new Date().toISOString()
        } as Student;
        addStudent(newObj);
        savedStudentObj = newObj;
      }
      addSecurityLog({
        role: 'siswa',
        userIdentifier: currentUserNis,
        action: 'UPDATE_STUDENT_SELF',
        category: 'DATA_CHANGE',
        status: 'SUCCESS',
        details: `Siswa memperbarui data mandiri (Nama: ${data.namaSiswa || 'Siswa'}, NIS: ${currentUserNis})`,
      });
      alert('Data Formulir Anda Berhasil Disimpan!');
      const refreshed = getStoredStudents();
      setStudents(refreshed);
      const updatedCurrent = refreshed.find(s => s.nis === currentUserNis);
      if (updatedCurrent) setEditingStudent(updatedCurrent);

      // Apps Script Auto Sync
      if (appsScriptUrl) {
        try {
          fetch(appsScriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
              target: 'student',
              action: 'save',
              student: savedStudentObj,
            }),
          }).catch((err) => console.log('Apps Script Student sync note:', err));
        } catch (err) {}
      }

      return;
    }

    if ('id' in data && data.id) {
      savedStudentObj = data as Student;
      updateStudent(savedStudentObj);
      addSecurityLog({
        role: userRole || 'superadmin',
        action: 'UPDATE_STUDENT',
        category: 'DATA_CHANGE',
        status: 'SUCCESS',
        details: `Memperbarui data siswa (${data.namaSiswa}, NIS: ${data.nis})`,
      });
    } else {
      const newObj: Student = {
        id: 'std-' + Date.now(),
        ...data,
        updatedAt: new Date().toISOString()
      } as Student;
      addStudent(newObj);
      savedStudentObj = newObj;
      addSecurityLog({
        role: userRole || 'superadmin',
        action: 'ADD_STUDENT',
        category: 'DATA_CHANGE',
        status: 'SUCCESS',
        details: `Menambah siswa baru (${data.namaSiswa}, NIS: ${data.nis})`,
      });
    }

    // Apps Script Auto Sync
    if (appsScriptUrl) {
      try {
        fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            target: 'student',
            action: 'save',
            student: savedStudentObj,
          }),
        }).catch((err) => console.log('Apps Script Student sync note:', err));
      } catch (err) {}
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
    const target = students.find((s) => s.id === id);
    deleteStudent(id);

    if (appsScriptUrl) {
      try {
        fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            target: 'student',
            action: 'delete',
            id,
          }),
        }).catch((err) => console.log('Apps Script Student delete note:', err));
      } catch (err) {}
    }

    addSecurityLog({
      role: userRole || 'superadmin',
      action: 'DELETE_STUDENT',
      category: 'DATA_CHANGE',
      status: 'SUCCESS',
      details: `Menghapus data siswa (${target?.namaSiswa || id}, NIS: ${target?.nis || '-'})`,
    });
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
      addSecurityLog({
        role: 'superadmin',
        action: 'RESET_STUDENTS_DATA',
        category: 'SYSTEM',
        status: 'WARNING',
        details: 'Super Admin mereset seluruh database siswa ke sampel awal bawaan',
      });
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

  // Toggle Student Form Access (Open / Close)
  const handleToggleStudentFormAccess = (isOpen: boolean) => {
    setIsStudentFormOpen(isOpen);
    saveStudentFormAccess(isOpen);
    addSecurityLog({
      role: userRole || 'superadmin',
      action: 'TOGGLE_STUDENT_FORM_ACCESS',
      category: 'SETTINGS',
      status: 'SUCCESS',
      details: `Admin ${isOpen ? 'MEMBUKA' : 'MENUTUP'} akses Formulir Pendataan Siswa`,
    });
  };

  // Refresh trigger
  const handleRefreshData = () => {
    const refreshed = getStoredStudents();
    setStudents(refreshed);
    setLaptops(getStoredLaptops());
    setProktorList(getStoredProktorTeknisi());
    setDocSettings(getStoredDocSettings());
    setAppsScriptUrl(getAppsScriptUrl());
    setIsStudentFormOpen(getStoredStudentFormAccess());
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
          if (userRole === 'proktor' && (tab === 'form' || tab === 'appscript' || tab === 'settings')) {
            alert('Akses Proktor/Teknisi dikhususkan untuk Pendataan Laptop & Sarana Lab TKA, Overview, Data Siswa, serta Referensi PTN.');
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
        isStudentFormOpen={isStudentFormOpen}
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
          isCompactMode={isCompactMode}
          setIsCompactMode={setIsCompactMode}
          userRole={userRole}
        />

        {/* Dynamic View Content */}
        <main className={`flex-1 ${isCompactMode ? 'p-2 text-xs max-w-full' : 'p-4 lg:p-8 max-w-7xl'} w-full mx-auto transition-all`}>
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
              onClearData={() => {
                const cleared = clearAllStudentsData();
                setStudents(cleared);
                addSecurityLog({
                  role: userRole,
                  action: 'CLEAR_ALL_STUDENTS',
                  category: 'SYSTEM',
                  status: 'WARNING',
                  details: 'Pengguna mengosongkan seluruh database siswa (menghapus data dummy)',
                });
              }}
              onRefreshData={handleRefreshData}
              isReadOnly={userRole === 'walikelas' || userRole === 'bk'}
              userRole={userRole}
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
              onOpenBanPtDirectory={() => setActiveTab('banpt')}
              prefilledBanPtSelection={pendingBanPtSelection}
              onClearPrefilledBanPt={() => setPendingBanPtSelection(null)}
              userRole={userRole}
              isStudentFormOpen={isStudentFormOpen}
            />
          )}

          {activeTab === 'analysis' && userRole !== 'siswa' && <TkaAnalysisView students={students} />}

          {activeTab === 'laptop' && userRole !== 'siswa' && (
            <LaptopInventoryView
              students={students}
              laptops={laptops}
              proktorList={proktorList}
              docSettings={docSettings}
              appsScriptUrl={appsScriptUrl}
              onSyncGoogleSheets={syncFromGoogleSheets}
              onNavigateToAppScript={() => setActiveTab('appscript')}
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
              onClearStudentsData={() => {
                const cleared = clearAllStudentsData();
                setStudents(cleared);
                addSecurityLog({
                  role: 'superadmin',
                  action: 'CLEAR_ALL_STUDENTS',
                  category: 'SYSTEM',
                  status: 'WARNING',
                  details: 'Super Admin mengosongkan seluruh database siswa (menghapus data dummy)',
                });
              }}
              onResetLaptopsData={handleResetLaptops}
              totalStudents={students.length}
              totalLaptops={laptops.length}
              isStudentFormOpen={isStudentFormOpen}
              onToggleStudentFormAccess={handleToggleStudentFormAccess}
              onDataRestored={() => {
                setStudents(getStoredStudents());
                setLaptops(getStoredLaptops());
                setProktorList(getStoredProktorTeknisi());
                setDocSettings(getStoredDocSettings());
                setAppsScriptUrl(getAppsScriptUrl());
                setIsStudentFormOpen(getStoredStudentFormAccess());
              }}
            />
          )}

          {activeTab === 'banpt' && (
            <BanPtDirectoryView
              onSelectProdiForForm={(ptn, prodi, choice, akreditasi) => {
                setPendingBanPtSelection({ targetChoice: choice, ptn, prodi, akreditasi });
                setActiveTab('form');
              }}
            />
          )}

          {activeTab === 'mapelPilihan' && <MapelPilihanView userRole={userRole} />}

          {activeTab === 'snbpCalc' && <SnbpCalculatorView students={students} userRole={userRole} />}
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

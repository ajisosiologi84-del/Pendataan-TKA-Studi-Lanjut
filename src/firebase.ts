import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get Firestore Instance with custom database ID if provided
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Collection References
export const studentsCol = collection(db, 'students');
export const laptopsCol = collection(db, 'laptops');
export const securityLogsCol = collection(db, 'securityLogs');
export const systemSettingsCol = collection(db, 'systemSettings');

// Circuit breaker flag for quota exhaustion
let isQuotaExceeded = false;

function checkQuotaError(error: any): boolean {
  if (!error) return false;
  const msg = String(error.message || error);
  const code = String(error.code || '');
  if (code === 'resource-exhausted' || msg.includes('Quota exceeded') || msg.includes('resource-exhausted')) {
    if (!isQuotaExceeded) {
      isQuotaExceeded = true;
      console.warn('[Firestore] Quota exceeded. Gracefully falling back to localStorage for seamless operation.');
    }
    return true;
  }
  return false;
}

/**
 * Firebase Synchronization Helpers
 */
export async function syncStudentToFirestore(studentData: any) {
  if (isQuotaExceeded) return;
  try {
    if (!studentData || !studentData.id) return;
    const docRef = doc(db, 'students', String(studentData.id));
    await setDoc(docRef, { ...studentData, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    if (!checkQuotaError(error)) {
      console.warn('Firestore sync student error:', error);
    }
  }
}

export async function deleteStudentFromFirestore(id: string) {
  if (isQuotaExceeded) return;
  try {
    const docRef = doc(db, 'students', String(id));
    await deleteDoc(docRef);
  } catch (error) {
    if (!checkQuotaError(error)) {
      console.warn('Firestore delete student error:', error);
    }
  }
}

export async function fetchStudentsFromFirestore() {
  if (isQuotaExceeded) return null;
  try {
    const snapshot = await getDocs(studentsCol);
    const list: any[] = [];
    snapshot.forEach((d) => {
      list.push(d.data());
    });
    return list;
  } catch (error) {
    if (!checkQuotaError(error)) {
      console.warn('Firestore fetch students error:', error);
    }
    return null;
  }
}

export async function syncLaptopToFirestore(laptopData: any) {
  if (isQuotaExceeded) return;
  try {
    if (!laptopData || !laptopData.id) return;
    const docRef = doc(db, 'laptops', String(laptopData.id));
    await setDoc(docRef, { ...laptopData, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    if (!checkQuotaError(error)) {
      console.warn('Firestore sync laptop error:', error);
    }
  }
}

export async function syncSecurityLogToFirestore(logData: any) {
  if (isQuotaExceeded) return;
  try {
    if (!logData || !logData.id) return;
    const docRef = doc(db, 'securityLogs', String(logData.id));
    await setDoc(docRef, logData, { merge: true });
  } catch (error) {
    if (!checkQuotaError(error)) {
      console.warn('Firestore sync security log error:', error);
    }
  }
}

export async function syncSystemSettingsToFirestore(key: string, data: any) {
  if (isQuotaExceeded) return;
  try {
    const docRef = doc(db, 'systemSettings', key);
    await setDoc(docRef, { data, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    if (!checkQuotaError(error)) {
      console.warn('Firestore sync settings error:', error);
    }
  }
}

export async function fetchSystemSettingsFromFirestore(key: string) {
  if (isQuotaExceeded) return null;
  try {
    const docRef = doc(db, 'systemSettings', key);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data().data;
    }
    return null;
  } catch (error) {
    if (!checkQuotaError(error)) {
      console.warn('Firestore fetch settings error:', error);
    }
    return null;
  }
}

export function subscribeSystemSettingFromFirestore(key: string, callback: (data: any) => void) {
  if (isQuotaExceeded) return () => {};
  const docRef = doc(db, 'systemSettings', key);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists() && snap.data()?.data !== undefined) {
        callback(snap.data().data);
      }
    },
    (error) => {
      if (!checkQuotaError(error)) {
        console.warn(`Firestore setting snapshot error (${key}):`, error);
      }
    }
  );
}

/**
 * Realtime listener for students collection
 */
export function subscribeStudentsFromFirestore(callback: (students: any[]) => void) {
  if (isQuotaExceeded) return () => {};
  return onSnapshot(
    studentsCol,
    (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((d) => {
        list.push(d.data());
      });
      callback(list);
    },
    (error) => {
      if (!checkQuotaError(error)) {
        console.warn('Firestore students snapshot error:', error);
      }
    }
  );
}

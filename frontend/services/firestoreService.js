/**
 * Firestore Chat Persistence Service
 * Stores chat sessions under: users/{uid}/sessions/{sessionId}
 * Stores performance data under: users/{uid}/meta/performance
 * UID is passed explicitly to avoid auth timing issues.
 */
import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

const sessionsRef = (uid) => collection(db, 'users', uid, 'sessions');
const sessionRef  = (uid, sid) => doc(db, 'users', uid, 'sessions', sid);
const perfRef     = (uid) => doc(db, 'users', uid, 'meta', 'performance');

// ── Sessions ──────────────────────────────────────────────────────────────────

export const loadSessions = async (uid) => {
  if (!uid) { console.warn('loadSessions: no uid'); return []; }
  try {
    const q = query(sessionsRef(uid), orderBy('updatedAt', 'desc'));
    const snap = await getDocs(q);
    const results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log('Loaded sessions from Firestore:', results.length);
    return results;
  } catch (e) {
    console.error('loadSessions error:', e.message);
    return [];
  }
};

export const saveSession = async (uid, session) => {
  if (!uid) return;
  try {
    await setDoc(sessionRef(uid, session.id), {
      title: session.title || 'New Chat',
      messages: session.messages || [],
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error('saveSession error:', e.message);
  }
};

export const updateSessionMessages = async (uid, sessionId, messages, title) => {
  if (!uid) return;
  try {
    const update = { messages, updatedAt: serverTimestamp() };
    if (title) update.title = title;
    await updateDoc(sessionRef(uid, sessionId), update);
  } catch (e) {
    try {
      await setDoc(sessionRef(uid, sessionId), {
        title: title || 'New Chat',
        messages,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
    } catch (e2) {
      console.error('updateSessionMessages error:', e2.message);
    }
  }
};

export const updateSessionTitle = async (uid, sessionId, title) => {
  if (!uid) return;
  try {
    await updateDoc(sessionRef(uid, sessionId), { title, updatedAt: serverTimestamp() });
  } catch (e) {
    console.error('updateSessionTitle error:', e.message);
  }
};

export const deleteSession = async (uid, sessionId) => {
  if (!uid) return;
  try {
    await deleteDoc(sessionRef(uid, sessionId));
  } catch (e) {
    console.error('deleteSession error:', e.message);
  }
};

// ── Performance Data ──────────────────────────────────────────────────────────

export const savePerformanceData = async (uid, performanceData) => {
  if (!uid) return;
  try {
    await setDoc(perfRef(uid), {
      data: performanceData,
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.error('savePerformanceData error:', e.message);
  }
};

export const loadPerformanceData = async (uid) => {
  if (!uid) return null;
  try {
    const snap = await getDoc(perfRef(uid));
    if (snap.exists()) return snap.data().data;
  } catch (e) {
    console.error('loadPerformanceData error:', e.message);
  }
  return null;
};
import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Header.jsx';
import LoginPage from './components/LoginPage.jsx';
import ChatPage from './components/ChatPage.jsx';
import DashboardPage from './components/DashboardPage.jsx';
import PerformancePage from './components/PerformancePage.jsx';
import ProfilePage from './components/ProfilePage.jsx';
import { Page, Difficulty, ENGINEERING_TOPICS } from './constants.js';
import { sendMessageToTutor, generateTitleAndSuggestions, submitQuizAnswer, getUserStats } from './services/geminiService.js';
import { loadSessions, saveSession, updateSessionMessages, updateSessionTitle, deleteSession, savePerformanceData, loadPerformanceData } from './services/firestoreService.js';
import { auth, logout } from './services/auth.js';
import { onAuthStateChanged } from 'firebase/auth';

const DEFAULT_MESSAGE = {
  role: 'model',
  text: "Hello! I'm Cognite, your AI engineering tutor. Ask me anything to get started, or browse topics for a guided lesson."
};

const newSessionTemplate = (msg = DEFAULT_MESSAGE) => ({
  id: Date.now().toString(),
  title: 'New Chat',
  messages: [msg],
  createdAt: new Date().toISOString(),
});

const App = () => {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(Page.Login);
  const [difficulty, setDifficulty] = useState(Difficulty.Beginner);
  const [performanceData, setPerformanceData] = useState(
    ENGINEERING_TOPICS.map(topic => ({ name: topic.split(' ')[0], correct: 0, incorrect: 0 }))
  );
  const [backendStats, setBackendStats] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Chat state
  const [chatSessions, setChatSessions] = useState([newSessionTemplate()]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [suggestedTopics, setSuggestedTopics] = useState([]);

  // Save debounce ref
  const saveTimer = useRef(null);
  const uidRef = useRef(null); // always holds current Firebase UID
  const perfDataRef = useRef(performanceData); // always holds latest performance data

  // Keep perfDataRef in sync
  useEffect(() => { perfDataRef.current = performanceData; }, [performanceData]);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.remove(isDark ? 'light' : 'dark');
    root.classList.add(isDark ? 'dark' : 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // ── Firestore helpers ──────────────────────────────────────────────────────

  const loadUserSessions = async (uid) => {
    setSessionsLoading(true);
    try {
      // Load performance data — update both state and ref
      const savedPerf = await loadPerformanceData(uid);
      if (savedPerf && Array.isArray(savedPerf) && savedPerf.length > 0) {
        perfDataRef.current = savedPerf;
        setPerformanceData(savedPerf);
        console.log('Loaded performance data:', savedPerf.filter(d => d.correct > 0 || d.incorrect > 0));
      }

      const sessions = await loadSessions(uid);
      if (sessions.length > 0) {
        setChatSessions(sessions);
        setActiveSessionId(sessions[0].id);
      } else {
        const initial = newSessionTemplate();
        setChatSessions([initial]);
        setActiveSessionId(initial.id);
        await saveSession(uid, initial);
      }
    } catch (e) {
      console.warn('Failed to load sessions:', e);
      const initial = newSessionTemplate();
      setChatSessions([initial]);
      setActiveSessionId(initial.id);
    } finally {
      setSessionsLoading(false);
    }
  };

  const debouncedSave = (sessionId, messages, title) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      updateSessionMessages(uidRef.current, sessionId, messages, title);
    }, 1000); // Save 1s after last change
  };

  // ── Analytics ──────────────────────────────────────────────────────────────

  const fetchBackendStats = async () => {
    try {
      const stats = await getUserStats();
      setBackendStats(stats);
    } catch (e) {
      console.warn('Could not fetch backend stats:', e.message);
    }
  };

  // ── Auth ───────────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    setPerformanceData(ENGINEERING_TOPICS.map(t => ({ name: t.split(' ')[0], correct: 0, incorrect: 0 })));
    const initial = newSessionTemplate();
    setChatSessions([initial]);
    setActiveSessionId(initial.id);
    setBackendStats(null);
    setUser(null);
    setCurrentPage(Page.Login);
    uidRef.current = null;
    try { await logout(); } catch {}
  };

  const handleNavigate = (page) => {
    if (page === Page.Performance) fetchBackendStats();
    setCurrentPage(page);
  };

  const handleUpdateUser = (updatedData) => {
    if (user) setUser(prev => ({ ...prev, ...updatedData }));
  };

  const handleResetPerformance = () => {
    const fresh = ENGINEERING_TOPICS.map(t => ({ name: t.split(' ')[0], correct: 0, incorrect: 0 }));
    perfDataRef.current = fresh;         // keep ref in sync
    setPerformanceData(fresh);
    setBackendStats(null);
    savePerformanceData(uidRef.current, fresh);
  };

  // ── Chat handlers ──────────────────────────────────────────────────────────

  const handleNewSession = async () => {
    const newSession = newSessionTemplate({ role: 'model', text: "Ask me anything!" });
    setChatSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    await saveSession(uidRef.current, newSession);
  };

  const handleSelectSession = (id) => {
    setActiveSessionId(id);
  };

  const handleDeleteSession = async (sessionId) => {
    await deleteSession(uidRef.current, sessionId);
    setChatSessions(prev => {
      const remaining = prev.filter(s => s.id !== sessionId);
      if (remaining.length === 0) {
        const fresh = newSessionTemplate();
        saveSession(uidRef.current, fresh);
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === sessionId) setActiveSessionId(remaining[0].id);
      return remaining;
    });
  };

  const handleSendMessage = async (message) => {
    if (!message.trim() || isChatLoading) return;

    const userMessage = { role: 'user', text: message };
    const activeSession = chatSessions.find(s => s.id === activeSessionId);
    if (!activeSession) return;

    const updatedMessages = [...activeSession.messages, userMessage];
    const isFirstUserMessage = activeSession.messages.filter(m => m.role === 'user').length === 0;

    setChatSessions(sessions => sessions.map(s =>
      s.id === activeSessionId ? { ...s, messages: updatedMessages } : s
    ));
    setChatInput('');
    setIsChatLoading(true);

    try {
      const historyForAPI = activeSession.messages.map(({ role, text }) => ({ role, parts: [{ text }] }));

      // Add empty streaming message
      setChatSessions(sessions => sessions.map(s =>
        s.id === activeSessionId ? { ...s, messages: [...updatedMessages, { role: 'model', text: '' }] } : s
      ));

      let streamedText = '';
      const responseText = await sendMessageToTutor(
        historyForAPI,
        message,
        (token) => {
          streamedText += token;
          setChatSessions(sessions => sessions.map(s =>
            s.id === activeSessionId
              ? { ...s, messages: [...updatedMessages, { role: 'model', text: streamedText }] }
              : s
          ));
        },
        activeSessionId
      );

      const finalMessages = [...updatedMessages, { role: 'model', text: responseText || streamedText }];
      setChatSessions(sessions => sessions.map(s =>
        s.id === activeSessionId ? { ...s, messages: finalMessages } : s
      ));

      // Generate title on first message, then save to Firestore
      if (isFirstUserMessage && finalMessages.length > 2) {
        generateTitleAndSuggestions(finalMessages).then(({ title, topics }) => {
          setSuggestedTopics(topics);
          setChatSessions(sessions => sessions.map(s =>
            s.id === activeSessionId ? { ...s, title } : s
          ));
          // Save with new title
          updateSessionMessages(uidRef.current, activeSessionId, finalMessages, title);
          updateSessionTitle(uidRef.current, activeSessionId, title);
        }).catch(() => {
          debouncedSave(activeSessionId, finalMessages, null);
        });
      } else {
        debouncedSave(activeSessionId, finalMessages, null);
      }

    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = { role: 'model', text: "Sorry, I encountered an error. Please try again." };
      const errMessages = [...updatedMessages, errorMessage];
      setChatSessions(sessions => sessions.map(s =>
        s.id === activeSessionId ? { ...s, messages: errMessages } : s
      ));
      debouncedSave(activeSessionId, errMessages, null);
    } finally {
      setIsChatLoading(false);
    }
  };

  // ── Quiz handler ───────────────────────────────────────────────────────────

  const handleQuizAnswer = async (topic, quiz, selectedIndex, diff) => {
    const uid = uidRef.current;

    // Call Evaluator Agent — get rich feedback
    let evaluation = null;
    try {
      evaluation = await submitQuizAnswer({
        topic,
        difficulty: diff,
        question: quiz.question,
        options: quiz.options || [],
        selected_index: selectedIndex,
        correct_index: quiz.correctAnswerIndex,
      });
      fetchBackendStats();
    } catch (e) {
      console.warn('Quiz submission failed:', e.message);
    }

    // Fall back to local check if API failed
    const isCorrect = evaluation?.correct ?? (selectedIndex === quiz.correctAnswerIndex);

    // Update performance data synchronously via ref — no race conditions
    const updated = perfDataRef.current.map(d =>
      d.name === topic.split(' ')[0]
        ? { ...d, [isCorrect ? 'correct' : 'incorrect']: d[isCorrect ? 'correct' : 'incorrect'] + 1 }
        : d
    );
    perfDataRef.current = updated;       // update ref immediately
    setPerformanceData(updated);         // update UI
    savePerformanceData(uid, updated);   // persist to Firestore

    handleUpdateUser({ streak: isCorrect ? (user.streak || 0) + 1 : 0 });

    // Return rich evaluation to FeedbackModal
    return {
      isCorrect,
      explanation: evaluation?.explanation || quiz.explanation,
      feedback: evaluation?.feedback || null,
      misconception: evaluation?.misconception || null,
      partialCredit: evaluation?.partial_credit ?? (isCorrect ? 1.0 : 0.0),
      hintForNext: evaluation?.hint_for_next || null,
    };
  };

  // ── Firebase auth listener ─────────────────────────────────────────────────

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          avatar: 'UserCircle',
          learningGoal: 3,
          streak: 0,
        });
        setCurrentPage(Page.Chat);
        uidRef.current = firebaseUser.uid;
        await loadUserSessions(firebaseUser.uid);
        fetchBackendStats();
      } else {
        setUser(null);
        setCurrentPage(Page.Login);
      }
    });
    return () => unsubscribe();
  }, []);

  if (!user) return <LoginPage onLogin={() => {}} />;

  const chatProps = {
    sessions: chatSessions,
    activeSessionId,
    onSelectSession: handleSelectSession,
    onNewSession: handleNewSession,
    onDeleteSession: handleDeleteSession,
    onSendMessage: handleSendMessage,
    isLoading: isChatLoading,
    input: chatInput,
    setInput: setChatInput,
    sessionsLoading,
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.Chat:
        return <ChatPage user={user} onNavigate={handleNavigate} {...chatProps} />;
      case Page.Dashboard:
        return <DashboardPage
          difficulty={difficulty} setPerformanceData={setPerformanceData}
          onQuizAnswer={handleQuizAnswer} user={user} onUpdateUser={handleUpdateUser}
          suggestedTopics={suggestedTopics} {...chatProps}
        />;
      case Page.Performance:
        return <PerformancePage
          performanceData={performanceData} backendStats={backendStats}
          difficulty={difficulty} setDifficulty={setDifficulty}
          onReset={handleResetPerformance} isLoading={false} theme={theme}
        />;
      case Page.Profile:
        return <ProfilePage user={user} onUpdateUser={handleUpdateUser} />;
      default:
        return <ChatPage user={user} onNavigate={handleNavigate} {...chatProps} />;
    }
  };

  return (
    <div className="bg-background min-h-screen font-sans flex flex-col">
      <Navbar user={user} currentPage={currentPage} onNavigate={handleNavigate}
        onLogout={handleLogout} theme={theme} setTheme={setTheme} />
      <div className="animate-fade-in flex-grow">
        {renderPage()}
      </div>
    </div>
  );
};

export default App;
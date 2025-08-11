import React, { useState, useEffect } from 'react';
import Navbar from './components/Header.jsx';
import LoginPage from './components/LoginPage.jsx';
import ChatPage from './components/ChatPage.jsx';
import DashboardPage from './components/DashboardPage.jsx';
import PerformancePage from './components/PerformancePage.jsx';
import ProfilePage from './components/ProfilePage.jsx';
import { Page, Difficulty, ENGINEERING_TOPICS } from './constants.js';
import { sendMessageToTutor, generateTitleAndSuggestions } from './services/geminiService.js';
import { auth, logout } from './services/auth.js';
import { onAuthStateChanged } from 'firebase/auth';

const App = () => {
    const [user, setUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(Page.Login);
    const [difficulty, setDifficulty] = useState(Difficulty.Beginner);
    const [performanceData, setPerformanceData] = useState(
        ENGINEERING_TOPICS.map(topic => ({ name: topic.split(' ')[0], correct: 0, incorrect: 0 }))
    );
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');

    // --- Lifted Chat State ---
    const [initialChatSession] = useState({
        id: Date.now().toString(),
        title: 'New Chat',
        messages: [
            { role: 'model', text: "Hello! I'm Cognite, your AI engineering tutor. Ask me anything to get started, or browse topics for a guided lesson." }
        ]
    });
    const [chatSessions, setChatSessions] = useState([initialChatSession]);
    const [activeSessionId, setActiveSessionId] = useState(initialChatSession.id);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [suggestedTopics, setSuggestedTopics] = useState([]);


    useEffect(() => {
        const root = window.document.documentElement;
        
        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        root.classList.remove(isDark ? 'light' : 'dark');
        root.classList.add(isDark ? 'dark' : 'light');

        localStorage.setItem('theme', theme);

    }, [theme]);

    const handleLogin = (name, email) => {
        setUser({
            name,
            email,
            avatar: 'UserCircle',
            learningGoal: 3,
            streak: 0,
        });
        setCurrentPage(Page.Chat);
    };

    const handleLogout = async () => {
        handleResetPerformance();
        setChatSessions([initialChatSession]);
        setActiveSessionId(initialChatSession.id);
        setUser(null);
        setCurrentPage(Page.Login);
        try { await logout(); } catch {}
    };
    
    const handleNavigate = (page) => {
        setCurrentPage(page);
    };
    
    const handleUpdateUser = (updatedData) => {
        if (user) {
            setUser(prevUser => ({ ...prevUser, ...updatedData }));
        }
    };
    
    const handleResetPerformance = () => {
        setPerformanceData(ENGINEERING_TOPICS.map(topic => ({ name: topic.split(' ')[0], correct: 0, incorrect: 0 })));
    };

    // --- Lifted Chat Handlers ---
    const handleNewSession = () => {
        const newSession = {
            id: Date.now().toString(),
            title: 'New Chat',
            messages: [
                { role: 'model', text: "Ask me anything!" }
            ]
        };
        setChatSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
    };

    const handleSelectSession = (id) => {
        setActiveSessionId(id);
    };

    const handleSendMessage = async (message) => {
        if (!message.trim() || isChatLoading) return;

        const userMessage = { role: 'user', text: message };
        const activeSession = chatSessions.find(s => s.id === activeSessionId);
        if (!activeSession) return;

        const updatedMessages = [...activeSession.messages, userMessage];
        const isFirstUserMessage = activeSession.messages.filter(m => m.role === 'user').length === 0;

        setChatSessions(sessions => sessions.map(s => s.id === activeSessionId ? { ...s, messages: updatedMessages } : s));
        setChatInput('');
        setIsChatLoading(true);

        try {
            const historyForAPI = activeSession.messages.map(({role, text}) => ({role, parts: [{text}]}));
            const responseText = await sendMessageToTutor(historyForAPI, message);
            const modelMessage = { role: 'model', text: responseText };
            
            const finalMessages = [...updatedMessages, modelMessage];
            
            setChatSessions(sessions => sessions.map(s => s.id === activeSessionId ? { ...s, messages: finalMessages } : s));
            
            if (isFirstUserMessage && finalMessages.length > 2) {
                 generateTitleAndSuggestions(finalMessages).then(({title, topics}) => {
                    setSuggestedTopics(topics);
                    setChatSessions(sessions => sessions.map(s => s.id === activeSessionId ? { ...s, title } : s));
                }).catch(err => console.error("Failed to generate title/suggestions:", err));
            }

        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage = { role: 'model', text: "Sorry, I encountered an error. Please try again." };
            setChatSessions(sessions => sessions.map(s => s.id === activeSessionId ? { ...s, messages: [...updatedMessages, errorMessage] } : s));
        } finally {
            setIsChatLoading(false);
        }
    };


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser({
                    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                    email: firebaseUser.email || '',
                    avatar: 'UserCircle',
                    learningGoal: 3,
                    streak: 0,
                });
                setCurrentPage(Page.Chat);
            } else {
                setUser(null);
                setCurrentPage(Page.Login);
            }
        });
        return () => unsubscribe();
    }, []);

    if (!user) {
        return <LoginPage onLogin={handleLogin} />;
    }

    const renderPage = () => {
        const chatProps = {
            sessions: chatSessions,
            activeSessionId: activeSessionId,
            onSelectSession: handleSelectSession,
            onNewSession: handleNewSession,
            onSendMessage: handleSendMessage,
            isLoading: isChatLoading,
            input: chatInput,
            setInput: setChatInput,
        };

        switch (currentPage) {
            case Page.Chat:
                return <ChatPage 
                    user={user} 
                    onNavigate={handleNavigate}
                    {...chatProps}
                    />;
            case Page.Dashboard:
                return <DashboardPage 
                    difficulty={difficulty} 
                    setPerformanceData={setPerformanceData}
                    user={user}
                    onUpdateUser={handleUpdateUser}
                    suggestedTopics={suggestedTopics}
                    {...chatProps}
                />;
            case Page.Performance:
                return <PerformancePage 
                            performanceData={performanceData} 
                            difficulty={difficulty}
                            setDifficulty={setDifficulty}
                            onReset={handleResetPerformance}
                            isLoading={false}
                            theme={theme}
                        />;
            case Page.Profile:
                return <ProfilePage user={user} onUpdateUser={handleUpdateUser} />;
            default:
                return <ChatPage 
                    user={user}
                    onNavigate={handleNavigate}
                    {...chatProps}
                    />;
        }
    };

    return (
        <div className="bg-background min-h-screen font-sans flex flex-col">
            <Navbar user={user} currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleLogout} theme={theme} setTheme={setTheme} />
            <div className="animate-fade-in flex-grow">
                {renderPage()}
            </div>
        </div>
    );
};

export default App;
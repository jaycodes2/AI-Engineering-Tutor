import React from 'react';
import ChatInterface from './ChatInterface.jsx';
import { Page } from '../constants.js';
import { LightBulbIcon } from './icons.jsx';

const ChatPage = ({ 
    user, 
    onNavigate,
    sessions,
    activeSessionId,
    onSendMessage,
    isLoading,
    input,
    setInput
}) => {
    
    const activeSession = sessions.find(s => s.id === activeSessionId);
    const messages = activeSession ? activeSession.messages : [];

    return (
        <main className="p-4 lg:p-6 max-w-screen-xl mx-auto flex flex-col h-full">
            <div className="bg-card rounded-xl border border-border p-6 sm:p-8 text-center shadow-sm animate-fade-in mb-6">
                <div className="w-16 h-16 bg-purple-500/10 text-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Welcome, {user.name}!</h1>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    I'm Cognite, your personal AI tutor. Ask me anything to get started, or browse topics to begin a guided lesson.
                </p>
                <button 
                    onClick={() => onNavigate(Page.Dashboard)}
                    className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 inline-flex items-center"
                >
                    <LightBulbIcon className="w-5 h-5 mr-2" />
                    Browse Topics & Personalize
                </button>
            </div>
            <div className="flex-grow min-h-0">
                 <ChatInterface 
                    messages={messages}
                    onSendMessage={onSendMessage}
                    isLoading={isLoading}
                    input={input}
                    setInput={setInput}
                 />
            </div>
        </main>
    );
};

export default ChatPage;
import React, { useRef, useEffect, useState } from 'react';

const BrainIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
    <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
    <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
    <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
    <path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
    <path d="M6 18a4 4 0 0 1-1.967-.516"/>
    <path d="M19.967 17.484A4 4 0 0 1 18 18"/>
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m22 2-7 20-4-9-9-4 20-7z"/>
    <path d="M22 2 11 13"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5v14"/>
  </svg>
);

const ChatBubble = ({ msg, isNew }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end mb-6`}
         style={{ animation: isNew ? 'slideUp 0.3s ease-out' : 'none' }}>
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, color: 'white', boxShadow: '0 0 12px rgba(99,102,241,0.4)'
        }}>
          <BrainIcon />
        </div>
      )}
      <div style={{
        maxWidth: '70%',
        padding: isUser ? '10px 16px' : '12px 16px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser
          ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
          : 'rgba(255,255,255,0.05)',
        border: isUser ? 'none' : '1px solid rgba(255,255,255,0.08)',
        color: isUser ? '#fff' : 'rgba(255,255,255,0.9)',
        fontSize: 14, lineHeight: 1.6,
        boxShadow: isUser ? '0 4px 15px rgba(99,102,241,0.3)' : 'none',
        backdropFilter: !isUser ? 'blur(10px)' : 'none',
      }}
        dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }}
      />
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex gap-3 items-end mb-6">
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, boxShadow: '0 0 12px rgba(99,102,241,0.4)'
    }}>
      <BrainIcon />
    </div>
    <div style={{
      padding: '14px 18px', borderRadius: '18px 18px 18px 4px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', gap: 5, alignItems: 'center'
    }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: '50%',
          background: '#6366f1',
          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
        }} />
      ))}
    </div>
  </div>
);

const SessionItem = ({ session, isActive, onClick, onDelete }) => (
  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: 2 }}
       className="session-item">
    <button onClick={onClick} style={{
      flex: 1, textAlign: 'left', padding: '10px 14px',
      borderRadius: 10, border: 'none', cursor: 'pointer',
      background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
      borderLeft: isActive ? '2px solid #6366f1' : '2px solid transparent',
      color: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)',
      fontSize: 13, fontWeight: isActive ? 500 : 400,
      transition: 'all 0.15s ease',
      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      paddingRight: 32,
    }}>
      {session.title || 'New Chat'}
    </button>
    <button onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
      style={{
        position: 'absolute', right: 6,
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'rgba(255,255,255,0.2)', padding: 4, borderRadius: 4,
        display: 'none', alignItems: 'center', justifyContent: 'center',
        transition: 'color 0.15s',
      }}
      className="delete-btn">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12"/>
      </svg>
    </button>
  </div>
);

const ChatPage = ({
  user, onNavigate,
  sessions, activeSessionId,
  onSelectSession, onNewSession, onDeleteSession,
  onSendMessage, isLoading, input, setInput,
  sessionsLoading,
}) => {
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession?.messages || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
  };

  const suggestedPrompts = [
    "Explain how transformers work in ML",
    "What is Kirchhoff's voltage law?",
    "Walk me through Big O notation",
    "How does PID control work?",
  ];

  const isEmpty = messages.length <= 1;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        .send-btn:hover { background: linear-gradient(135deg, #4f46e5, #4338ca) !important; transform: scale(1.05); }
        .session-item:hover .delete-btn { display: flex !important; }
        .session-item:hover .delete-btn:hover { color: rgba(255,100,100,0.8) !important; }
        .send-btn:active { transform: scale(0.95); }
        .prompt-chip:hover { background: rgba(99,102,241,0.15) !important; border-color: rgba(99,102,241,0.4) !important; color: rgba(255,255,255,0.9) !important; }
        .new-chat-btn:hover { background: rgba(99,102,241,0.2) !important; }
        .chat-input:focus { outline: none; border-color: rgba(99,102,241,0.5) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .msg-scroll::-webkit-scrollbar { width: 4px; }
        .msg-scroll::-webkit-scrollbar-track { background: transparent; }
        .msg-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .sidebar-scroll::-webkit-scrollbar { width: 3px; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
      `}</style>

      <div style={{
        display: 'flex', height: 'calc(100vh - 64px)',
        fontFamily: "'DM Sans', sans-serif",
        background: '#0a0a0f',
        color: 'white',
      }}>

        {/* Sidebar */}
        <div style={{
          width: sidebarOpen ? 240 : 0,
          minWidth: sidebarOpen ? 240 : 0,
          overflow: 'hidden',
          transition: 'all 0.25s ease',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          background: '#0d0d14',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '16px 12px 12px', flexShrink: 0 }}>
            <button onClick={onNewSession} className="new-chat-btn" style={{
              width: '100%', padding: '9px 12px',
              borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)',
              color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 500,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.15s ease',
            }}>
              <PlusIcon /> New Chat
            </button>
          </div>

          <div style={{ padding: '0 8px', flex: 1, overflowY: 'auto' }} className="sidebar-scroll">
            <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.25)', padding: '8px 6px 6px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Recent
            </p>
            {sessionsLoading ? (
              <div style={{ padding: '12px 14px', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
                Loading...
              </div>
            ) : sessions.map(s => (
              <SessionItem
                key={s.id}
                session={s}
                isActive={s.id === activeSessionId}
                onClick={() => onSelectSession(s.id)}
                onDelete={onDeleteSession}
              />
            ))}
          </div>

          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
              {user?.name}
            </p>
          </div>
        </div>

        {/* Main chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>

          {/* Top bar */}
          <div style={{
            padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
            background: 'rgba(13,13,20,0.8)', backdropFilter: 'blur(10px)',
          }}>
            <button onClick={() => setSidebarOpen(o => !o)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)', padding: 6, borderRadius: 6,
              display: 'flex', alignItems: 'center', transition: 'color 0.15s',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 10px rgba(99,102,241,0.35)',
            }}>
              <BrainIcon />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Cognite</p>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(99,102,241,0.8)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                Online
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="msg-scroll" style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 8px' }}>
            {isEmpty ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', animation: 'fadeIn 0.5s ease', paddingBottom: 40 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20, boxShadow: '0 0 30px rgba(99,102,241,0.3)',
                }}>
                  <BrainIcon />
                </div>
                <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
                  Hi {user?.name?.split(' ')[0]}, I'm Cognite
                </h2>
                <p style={{ margin: '0 0 32px', fontSize: 14, color: 'rgba(255,255,255,0.4)', textAlign: 'center', maxWidth: 380 }}>
                  Your AI engineering tutor. Ask me anything about circuits, algorithms, thermodynamics, and more.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 500 }}>
                  {suggestedPrompts.map((p, i) => (
                    <button key={i} onClick={() => { setInput(p); inputRef.current?.focus(); }}
                      className="prompt-chip"
                      style={{
                        padding: '8px 14px', borderRadius: 20,
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.04)',
                        color: 'rgba(255,255,255,0.6)', fontSize: 13,
                        cursor: 'pointer', transition: 'all 0.15s ease',
                      }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ maxWidth: 760, margin: '0 auto' }}>
                {messages.map((msg, i) => (
                  <ChatBubble key={i} msg={msg} isNew={i === messages.length - 1} />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <div style={{
            padding: '16px 24px 20px', flexShrink: 0,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(13,13,20,0.9)', backdropFilter: 'blur(10px)',
          }}>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
              <div style={{
                display: 'flex', gap: 10, alignItems: 'flex-end',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 14, padding: '4px 4px 4px 16px',
                transition: 'border-color 0.2s',
              }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Ask Cognite anything..."
                  disabled={isLoading}
                  rows={1}
                  className="chat-input"
                  style={{
                    flex: 1, background: 'none', border: 'none',
                    color: 'rgba(255,255,255,0.9)', fontSize: 14,
                    resize: 'none', padding: '10px 0',
                    fontFamily: "'DM Sans', sans-serif",
                    lineHeight: 1.5, minHeight: 40, maxHeight: 120,
                    overflowY: 'auto',
                  }}
                />
                <button onClick={handleSend} disabled={isLoading || !input.trim()}
                  className="send-btn"
                  style={{
                    width: 38, height: 38, borderRadius: 10, border: 'none',
                    background: input.trim() && !isLoading
                      ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                      : 'rgba(255,255,255,0.08)',
                    color: input.trim() && !isLoading ? '#fff' : 'rgba(255,255,255,0.2)',
                    cursor: input.trim() && !isLoading ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s ease', flexShrink: 0,
                    boxShadow: input.trim() && !isLoading ? '0 4px 12px rgba(99,102,241,0.4)' : 'none',
                  }}>
                  <SendIcon />
                </button>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
                Press Enter to send · Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatPage;
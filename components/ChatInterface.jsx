import React, { useRef, useEffect } from 'react';
import { SendIcon, BrainCircuitIcon } from './icons.jsx';

const ChatInterface = ({ messages, onSendMessage, isLoading, input, setInput }) => {
    const chatContainerRef = useRef(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = () => {
        if (input.trim() === '' || isLoading) return;
        onSendMessage(input);
    };

    return (
        <div className="bg-card rounded-xl border border-border flex flex-col h-full shadow-sm">
            <div className="p-4 border-b border-border flex items-center">
                <BrainCircuitIcon className="w-6 h-6 text-purple-500 mr-3"/>
                <h3 className="text-lg font-bold text-foreground">Chat with Cognite</h3>
            </div>
            <div ref={chatContainerRef} className="flex-grow p-4 space-y-6 overflow-y-auto">
                {messages && messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 text-sm ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0"><BrainCircuitIcon className="w-5 h-5 text-purple-500"/></div>}
                        <div className={`max-w-2xl p-3 rounded-xl shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-secondary text-foreground rounded-bl-none'}`}>
                           <p className="leading-relaxed" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}/>
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex items-start gap-3 animate-fade-in">
                        <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0"><BrainCircuitIcon className="w-5 h-5 text-purple-500"/></div>
                         <div className="max-w-md p-3 rounded-xl shadow-sm bg-secondary text-foreground rounded-bl-none">
                            <div className="flex items-center space-x-1 animate-pulse-subtle">
                                <span className="w-2 h-2 bg-muted-foreground rounded-full"></span>
                                <span className="w-2 h-2 bg-muted-foreground rounded-full"></span>
                                <span className="w-2 h-2 bg-muted-foreground rounded-full"></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4 border-t border-border">
                <div className="flex items-center bg-secondary border border-border rounded-lg focus-within:ring-2 focus-within:ring-ring transition-shadow">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask a question..."
                        className="w-full bg-transparent p-3 text-foreground placeholder-muted-foreground focus:outline-none"
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading || input.trim() === ''} className="p-3 text-blue-500 hover:text-blue-400 disabled:text-muted-foreground transition-colors">
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;

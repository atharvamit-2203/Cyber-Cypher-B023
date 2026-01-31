'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FailureScenario } from '../lib/simulation-store';

interface ChatMessage {
    id: string;
    sender: 'user' | 'agent';
    text: string;
    type?: 'status' | 'reasoning' | 'action';
}

interface ChatbotProps {
    role?: 'customer' | 'engineer';
    activeScenario?: FailureScenario;
    onFixApplied?: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ role = 'customer', activeScenario = 'NONE', onFixApplied }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize welcome message based on role
    useEffect(() => {
        const initialText = role === 'engineer'
            ? 'System Copilot Online. Monitoring 4 active migration streams.'
            : 'Hi! I\'m your Support Agent. How can I help you?';

        setMessages([{ id: 'init', sender: 'agent', text: initialText }]);
    }, [role]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // React to failures (Scenario Trigger)
    useEffect(() => {
        if (activeScenario !== 'NONE') {
            setIsOpen(true);
            handleScenario(activeScenario);
        }
    }, [activeScenario]);

    const handleScenario = async (scenario: FailureScenario) => {
        await wait(500);

        // Different responses based on ROLE and SCENARIO
        if (role === 'customer') {
            switch (scenario) {
                case 'AUTH_FAILURE_API':
                    await addMessage({ sender: 'agent', text: 'Oops! I\'m having trouble loading the products. It looks like a connection issue on our end.' });
                    await addMessage({ sender: 'agent', text: 'I\'ve notified the tech team. Try refreshing in a minute.', type: 'reasoning' });
                    break;
                case 'INVENTORY_MISMATCH':
                    await addMessage({ sender: 'agent', text: 'Hold on! I can\'t add that to your cart.' });
                    await addMessage({ sender: 'agent', text: 'It seems this item is out of stock in our main warehouse, even though it says "Available". Very sorry about that!', type: 'reasoning' });
                    break;
                case 'CART_SYNC_FAILURE':
                    await addMessage({ sender: 'agent', text: 'I detected a glitch while updating your cart.' });
                    await addMessage({ sender: 'agent', text: 'Your items are safe, but our cart system is syncing slowly. I\'m fixing it now.', type: 'action' });
                    break;
                case 'CHECKOUT_GATEWAY_TIMEOUT':
                    await addMessage({ sender: 'agent', text: '⚠️ Payment Gateway Timeout detected.' });
                    await addMessage({ sender: 'agent', text: 'I\'ve proactively logged a high-priority ticket for you.', type: 'action' });
                    break;
            }
        } else {
            // Engineer Role Logic
            switch (scenario) {
                case 'AUTH_FAILURE_API':
                    await addMessage({ sender: 'agent', text: '🚨 ALERT: High rate of 401s on Product API.' });
                    await addMessage({ sender: 'agent', text: 'Analysis: Auth token rotation likely failed for pod-3.', type: 'reasoning' });
                    break;
                case 'INVENTORY_MISMATCH':
                    await addMessage({ sender: 'agent', text: '⚠️ Inventory Sync Mismatch detected.' });
                    await addMessage({ sender: 'agent', text: 'Root Cause: Legacy DB (0) != Headless DB (5). Recommendation: Run forced sync.', type: 'reasoning' });
                    break;
                case 'CART_SYNC_FAILURE':
                    await addMessage({ sender: 'agent', text: '⚠️ Webhook Error: Cart Update Failed.' });
                    await addMessage({ sender: 'agent', text: 'Endpoint returned 500. Check webhook logs.', type: 'reasoning' });
                    break;
                case 'CHECKOUT_GATEWAY_TIMEOUT':
                    await addMessage({ sender: 'agent', text: '🚨 CRITICAL: Checkout Gateway 504.' });
                    await addMessage({ sender: 'agent', text: 'Payment Provider is unresponsive. Suggest switching to backup provider.', type: 'action' });
                    break;
            }
        }
    };

    // Handle User Input (Simulated Intelligence)
    const handleUserMessage = async (text: string) => {
        await addMessage({ sender: 'user', text }, 0);

        const lowerText = text.toLowerCase();
        let responseText = '';
        let responseType: ChatMessage['type'] | undefined;

        setIsTyping(true);
        await wait(1000);

        if (role === 'engineer') {
            if (lowerText.includes('status') || lowerText.includes('health')) {
                responseText = 'System Health: 92%. Active Issues: 3. Migration Batch #4 is 85% complete.';
                responseType = 'status';
            } else if (lowerText.includes('fix') || lowerText.includes('restart')) {
                responseText = 'Executing remediation script... Done. Service restarted.';
                responseType = 'action';
                if (onFixApplied) onFixApplied();
            } else if (lowerText.includes('summary') || lowerText.includes('report')) {
                responseText = 'Summary: Checkout errors spiked at 10:00 AM due to Gateway Timeout. Automated mitigation applied.';
                responseType = 'reasoning';
            } else {
                responseText = 'I can help you analyze signals, run fixes, or check migration status.';
            }
        } else {
            // Customer Role
            if (lowerText.includes('help') || lowerText.includes('support')) {
                responseText = 'I\'m here! I track your session health automatically. If you see an error, I usually see it first.';
            } else if (lowerText.includes('ticket') || lowerText.includes('status')) {
                responseText = 'You have 1 active ticket regarding "Checkout Failure". Status: In Progress (Engineering is reviewing).';
                responseType = 'status';
            } else if (lowerText.includes('human') || lowerText.includes('agent')) {
                responseText = 'I\'ve flagged this conversation for a human agent. They will join shortly (Est. wait: 5 mins).';
            } else {
                responseText = 'I understand. Let me check my diagnostic logs... Everything looks green right now.';
            }
        }

        await addMessage({ sender: 'agent', text: responseText, type: responseType }, 0);
        setIsTyping(false);
    };

    const addMessage = async (msg: Omit<ChatMessage, 'id'>, delay: number = 500) => {
        if (delay > 0) {
            setIsTyping(true);
            await wait(delay);
        }
        setMessages(prev => [...prev, { ...msg, id: Date.now().toString() }]);
        if (delay > 0) setIsTyping(false);
    };

    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    return (
        <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none`}>
            {/* Chat Window */}
            <div
                className={`pointer-events-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col transition-all duration-300 origin-bottom-right overflow-hidden ${isOpen ? 'opacity-100 scale-100 translate-y-0 mb-4' : 'opacity-0 scale-90 translate-y-8 h-0'
                    }`}
                style={{ maxHeight: '600px' }}
            >
                {/* Header */}
                <div className={`p-4 ${role === 'engineer' ? 'bg-emerald-700/90' : 'bg-indigo-600/90'} backdrop-blur flex justify-between items-center text-white`}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">
                            {role === 'engineer' ? '⚙️' : '🤖'}
                        </div>
                        <div>
                            <div className="font-bold text-sm w-48 truncate">
                                {role === 'engineer' ? 'System Copilot' : 'Support Assistant'}
                            </div>
                            <div className="text-xs text-white/70 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Online
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">✕</button>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto bg-slate-900 space-y-4 max-h-80 min-h-[300px]">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.sender === 'user'
                                        ? (role === 'engineer' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-indigo-600 text-white rounded-br-none')
                                        : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                                    }`}
                            >
                                {msg.text}
                                {msg.type === 'reasoning' && (
                                    <div className="mt-2 text-xs text-indigo-300 flex items-center gap-1 font-medium border-t border-indigo-500/20 pt-2">
                                        <span>🧠</span> Analysis
                                    </div>
                                )}
                                {msg.type === 'action' && (
                                    <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1 font-medium border-t border-emerald-500/20 pt-2">
                                        <span>⚡</span> Action Taken
                                    </div>
                                )}
                                {msg.type === 'status' && (
                                    <div className="mt-2 text-xs text-blue-400 flex items-center gap-1 font-medium border-t border-blue-500/20 pt-2">
                                        <span>📊</span> Status Update
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-slate-700 flex gap-1">
                                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce"></span>
                                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce delay-75"></span>
                                <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce delay-150"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 border-t border-slate-800 bg-slate-900/50">
                    <input
                        type="text"
                        placeholder={role === 'engineer' ? "Type command (/fix, status)..." : "Type a message..."}
                        className="w-full bg-slate-950 text-white text-sm rounded-full px-4 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleUserMessage(e.currentTarget.value);
                                e.currentTarget.value = '';
                            }
                        }}
                    />
                </div>
            </div>

            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`pointer-events-auto w-14 h-14 rounded-full ${role === 'engineer' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'} shadow-lg flex items-center justify-center text-2xl transition-transform hover:scale-105 active:scale-95 ${isOpen ? 'rotate-90 opacity-0' : 'opacity-100'}`}
            >
                💬
            </button>
        </div>
    );
};

export default Chatbot;

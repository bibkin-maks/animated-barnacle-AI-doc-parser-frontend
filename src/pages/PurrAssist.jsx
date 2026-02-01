import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/SideBar";
import { useSignoutMutation, useSendMessageMutation } from "../slices/apiSlice";
import { AnimatePresence, motion } from "framer-motion";

import VoiceVisualizer from "../components/VoiceVisualizer";
import useVoiceInput from "../hooks/useVoiceInput";

// --- Icons ---
const SendIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

const MicIcon = ({ active }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-colors duration-300 ${active ? "animate-pulse" : ""}`}>
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
);

const UserIcon = () => (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
        ME
    </div>
);

const BotIcon = () => (
    <div className="w-8 h-8 rounded-full bg-[#1a1c23] border border-white/10 flex items-center justify-center shadow-lg">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
            <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
            <path d="M12 8v4" />
            <path d="M12 14v8" />
            <path d="M8 14h8" />
            <path d="M16 18h2a2 2 0 0 1 2 2" />
            <path d="M8 18H6a2 2 0 0 0-2 2" />
        </svg>
    </div>
);


// --- Components ---

const MessageBubble = ({ message }) => {
    const isAi = message.role === "AI";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`flex w-full ${isAi ? "justify-start" : "justify-end"} mb-6 group`}
        >
            <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${isAi ? "flex-row" : "flex-row-reverse"}`}>

                {/* Avatar */}
                <div className="flex-shrink-0 mt-1">
                    {isAi ? <BotIcon /> : <UserIcon />}
                </div>

                {/* Bubble */}
                <div className={`
                    relative p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm
                    ${isAi
                        ? "bg-[#1f2129]/80 backdrop-blur-md border border-white/5 text-slate-200 rounded-tl-none"
                        : "bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-tr-none shadow-purple-500/20 shadow-lg"}
                `}>
                    {message.content}

                    {/* Timestamp (Optional/Mock) */}
                    <div className={`
                        absolute -bottom-5 text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap
                        ${isAi ? "left-0" : "right-0"}
                    `}>
                        Just now
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default function PurrAssist() {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [signoutUser] = useSignoutMutation();
    const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = useCallback(() => setIsSidebarOpen((s) => !s), []);

    const [language, setLanguage] = useState('en-US');
    const { isListening, transcript, toggleListening, hasSupport, error: voiceError } = useVoiceInput(language);

    const [inputValue, setInputValue] = useState("");

    // Messages state - synced with User but optimized for local updates
    // We start with user.messages or empty.
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [user?.messages, isSending, transcript]);

    const handleSignOut = async () => {
        if (!token) return;
        await signoutUser(JSON.stringify({ token }));
        logout();
        navigate("/login");
    };

    const handleSendMessage = async () => {
        const text = inputValue.trim() || (isListening ? transcript : "");
        if (!text) return;

        // Reset input immediately
        setInputValue("");
        if (isListening) toggleListening();

        try {
            await sendMessage({ question: text }).unwrap();
        } catch (err) {
            console.error("Failed to send message:", err);
            // Optionally add error toast here
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en-US' ? 'ru-RU' : 'en-US');
    };

    // If voice is active, sync transcript to input (optional, or just show visible overlay)
    useEffect(() => {
        if (isListening && transcript) {
            // We can either update the input box or show a separate active transcript bubble
            // For a clean chat UI, let's update the input box temporarily? 
            // Or just let the generic "Listening..." UI handle it. 
            // Let's rely on the VoiceVisualizer area for the "active" state.
        }
    }, [isListening, transcript]);

    return (
        <div className="relative h-screen w-full overflow-hidden font-montserrat text-white bg-transparent flex flex-col">

            <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} onPurrAssist={() => setIsSidebarOpen(false)} />

            {/* Header */}
            <header className="relative z-10 flex-none h-16 w-full flex items-center justify-between px-4 lg:px-6 border-b border-white/5 bg-[#0f1115]/50 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 text-slate-400 hover:text-white"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-sm font-bold text-white tracking-wide uppercase">
                            Purr Assist
                        </h1>
                        <p className="text-[10px] text-slate-500 font-medium">
                            Premium AI Companion
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleLanguage}
                        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium"
                    >
                        <span>{language === 'en-US' ? 'EN' : 'RU'}</span>
                    </button>

                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-xs font-bold text-purple-300">
                        {user?.name?.[0] || "U"}
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 relative z-0 overflow-y-auto custom-scrollbar scroll-smooth" ref={messagesContainerRef}>
                <div className="max-w-3xl mx-auto px-4 py-8 min-h-full flex flex-col justify-end">

                    {/* Welcome / Empty State */}
                    {(!user?.messages || user.messages.length === 0) && (
                        <div className="flex-1 flex flex-col items-center justify-center -mt-20 opacity-50 select-none">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center mb-6 animate-pulse">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-purple-400/50">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                            </div>
                            <p className="text-lg text-slate-500 font-light">
                                Start a conversation with Purr Assist...
                            </p>
                        </div>
                    )}

                    <AnimatePresence initial={false}>
                        {user?.messages?.map((msg, idx) => (
                            <MessageBubble key={idx} message={msg} />
                        ))}
                    </AnimatePresence>

                    {/* Live Voice Transcript Bubble (if listening) */}
                    {isListening && transcript && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-end mb-6"
                        >
                            <div className="bg-gradient-to-br from-purple-600/50 to-blue-600/50 text-white/80 p-4 rounded-2xl rounded-tr-none backdrop-blur-sm border border-white/10 animate-pulse">
                                <span className="mr-2">🎤</span> {transcript}
                            </div>
                        </motion.div>
                    )}

                    {/* Loading Indicator */}
                    {isSending && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start mb-6"
                        >
                            <div className="bg-[#1f2129] px-4 py-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1 items-center">
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input Area */}
            <footer className="relative z-10 p-4 lg:p-6 bg-[#0f1115]/80 backdrop-blur-xl border-t border-white/5">
                <div className="max-w-3xl mx-auto relative">

                    {/* Voice Visualizer (Floating above input if active) */}
                    <AnimatePresence>
                        {isListening && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute bottom-full left-0 right-0 mb-4 flex justify-center pointer-events-none"
                            >
                                <div className="bg-black/40 backdrop-blur-md rounded-full px-6 py-2 border border-white/10 flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    <VoiceVisualizer isListening={isListening} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="relative flex items-center gap-2 bg-[#1a1c23] border border-white/10 rounded-2xl p-2 shadow-xl focus-within:ring-2 focus-within:ring-purple-500/30 focus-within:border-purple-500/50 transition-all duration-300">

                        {/* Mic Button */}
                        <button
                            onClick={toggleListening}
                            className={`
                                p-3 rounded-xl transition-all duration-300 flex-shrink-0
                                ${isListening
                                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"}
                            `}
                            title="Voice Input"
                        >
                            <MicIcon active={isListening} />
                        </button>

                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isListening ? (language === 'ru-RU' ? "Слушаю..." : "Listening...") : (language === 'ru-RU' ? "Напишите сообщение..." : "Type a message...")}
                            className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 text-sm md:text-base h-full py-2 px-1"
                            disabled={isListening}
                        />

                        {/* Send Button */}
                        <button
                            onClick={handleSendMessage}
                            disabled={(!inputValue.trim() && !isListening) || isSending}
                            className={`
                                p-3 rounded-xl transition-all duration-300 flex-shrink-0
                                ${inputValue.trim()
                                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20 hover:scale-105 active:scale-95"
                                    : "bg-white/5 text-slate-500 cursor-not-allowed"}
                            `}
                        >
                            <SendIcon />
                        </button>
                    </div>

                    <div className="text-center mt-2">
                        <p className="text-[10px] text-slate-600">
                            AI can make mistakes. Please verify important information.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}


import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import useVantaGlobe from "../hooks/useVantaGlobe";
import Sidebar from "../components/SideBar";
import { useSignoutMutation } from "../slices/apiSlice";

import VoiceVisualizer from "../components/VoiceVisualizer";
import useVoiceInput from "../hooks/useVoiceInput";

export default function PurrAssist() {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    // const vantaRef = useVantaGlobe();
    const [signoutUser] = useSignoutMutation();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = useCallback(() => setIsSidebarOpen((s) => !s), []);

    // Language State ('en-US' or 'ru-RU')
    const [language, setLanguage] = useState('en-US');

    // New voice hook with dynamic language
    const { isListening, transcript, toggleListening, hasSupport, error } = useVoiceInput(language);

    // Redirect if user is not authenticated
    useEffect(() => {
        if (!token) navigate("/login");
    }, [token, navigate]);

    const handlePurrAssist = useCallback(() => {
        // Already here
        setIsSidebarOpen(false);
    }, []);

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en-US' ? 'ru-RU' : 'en-US');
    };

    const handleSignOut = async () => {
        if (!token) return;
        await signoutUser(JSON.stringify({ token }));
        logout();
        navigate("/login");
    };

    const firstName = useMemo(
        () => user?.name?.split(" ")[0] || "there",
        [user]
    );

    return (
        <div className="relative h-screen w-full overflow-hidden font-montserrat text-white selection:bg-purple-500/30 flex flex-col">
            <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} onPurrAssist={handlePurrAssist} />

            {/* FIXED BACKGROUND */}
            {/* <div ref={vantaRef} className="fixed inset-0 pointer-events-none" /> */ /* REMOVED VANTA */}

            {/* Ambient lights */}
            <div className="pointer-events-none fixed inset-0 -z-5">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 blur-[100px] rounded-full" />
            </div>

            {/* Top Header Bar */}
            <header className="relative z-10 flex-none h-16 w-full flex items-center justify-between px-4 lg:px-6 border-b border-white/5 bg-[#0f1115]/80 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
                        aria-label="Toggle sidebar"
                        type="button"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <div className="flex flex-col gap-0.5">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold hidden sm:block">
                            AI Assistant
                        </p>
                        <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
                            Purr Assist
                        </h1>
                    </div>
                </div>

                {user && (
                    <div className="flex items-center gap-6">
                        {/* Language Toggle */}
                        <button
                            onClick={toggleLanguage}
                            className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center gap-2"
                        >
                            <span>{language === 'en-US' ? 'EN' : 'RU'}</span>
                            <span className="text-slate-400 text-[10px]">▼</span>
                        </button>

                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                                Logged in as
                            </p>
                            <p className="text-sm font-semibold">
                                {firstName}{" "}
                                <span className="text-xs text-emerald-400 ml-1">● Premium</span>
                            </p>
                        </div>

                        <button
                            onClick={handleSignOut}
                            className="
                                px-4 py-2 rounded-full border border-red-400/30 
                                text-red-300 text-xs font-bold uppercase tracking-wide
                                bg-red-500/5 backdrop-blur-md
                                hover:bg-red-500/15 hover:border-red-400/50 hover:text-red-200
                                transition-all duration-300
                            "
                        >
                            Sign out
                        </button>
                    </div>
                )}
            </header>

            {/* Center Content */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 overflow-hidden bg-[#0f1115]/30">

                <div className="relative mb-12 cursor-pointer" onClick={toggleListening}>
                    <VoiceVisualizer isListening={isListening} />
                </div>

                <div className="text-center space-y-3 px-4">
                    <h1 className="text-4xl font-bold text-white tracking-tight">
                        {error === "network"
                            ? "Connection Error"
                            : isListening
                                ? (language === 'ru-RU' ? "Слушаю..." : "Listening...")
                                : (language === 'ru-RU' ? "Чем могу помочь?" : "How can I help?")}
                    </h1>
                    {/* Dynamic Transcript Area */}
                    <div className="min-h-[60px] flex items-center justify-center">
                        {error ? (
                            <p className="text-red-400 text-sm md:text-base max-w-md mx-auto bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
                                {error === 'network'
                                    ? "Speech recognition requires an active internet connection. If using Brave, try disabling shields or use Chrome."
                                    : `Error: ${error}`}
                            </p>
                        ) : isListening && transcript ? (
                            <p className="text-emerald-300 text-lg md:text-xl font-medium max-w-2xl mx-auto animate-pulse">
                                "{transcript}"
                            </p>
                        ) : (
                            <p className="text-slate-300 text-lg max-w-md mx-auto">
                                {hasSupport
                                    ? "Tap the microphone to start talking based on your documents."
                                    : "Voice input is not supported in this browser."}
                            </p>
                        )}
                    </div>
                </div>

            </main>

        </div>
    );
}

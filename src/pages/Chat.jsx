import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import FileUpload from "../components/FileUpload";
import ChatInterface from "../components/ChatInterface";
import { useNavigate } from "react-router-dom";

import { useSignoutMutation } from "../slices/apiSlice";
import Sidebar from "../components/SideBar";

// ========================================================================
// Chat Component
// ========================================================================
const Chat = () => {
  const { user, token, logout } = useAuth();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(() => setIsSidebarOpen((s) => !s), []);
  const [showMobileContext, setShowMobileContext] = useState(false); // Mobile toggle

  const [signoutUser] = useSignoutMutation();
  const navigate = useNavigate();

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const handleSignOut = async () => {
    if (!token) return;
    await signoutUser(JSON.stringify({ token }));
    logout();
    navigate("/login");
  };

  // Derived name
  const firstName = useMemo(
    () => user?.name?.split(" ")[0] || "there",
    [user]
  );

  const activeDocumentName =
    uploadedFile?.name || user?.document?.name || "No file yet";

  const handlePurrAssist = useCallback(() => {
    setIsSidebarOpen(false);
    navigate("/purr-assist");
  }, [navigate]);

  return (
    <div className="relative h-screen w-full overflow-hidden font-montserrat text-white bg-transparent selection:bg-purple-500/30 flex flex-col">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} onPurrAssist={handlePurrAssist} />

      {/* Top Header Bar */}
      <header className="relative z-10 flex-none h-16 w-full flex items-center justify-between px-4 lg:px-6 border-b border-white/5 bg-[#0f1115]/50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 text-slate-400 hover:text-white"
            aria-label="Toggle sidebar"
            type="button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-white tracking-wide uppercase">
              DocuChat
            </h1>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] text-slate-500 font-medium tracking-wider">
                Private Workspace
              </p>
            </div>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            {/* Simple Profile Pill */}
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full border border-white/5 bg-white/5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-[10px] font-bold">
                {firstName[0]}
              </div>
              <span className="text-xs font-medium text-slate-300 pr-1">{firstName}</span>
            </div>

            {/* Mobile Context Toggle */}
            <button
              onClick={() => setShowMobileContext(!showMobileContext)}
              className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
            >
              <span className="text-lg">📄</span>
            </button>

            <button
              onClick={handleSignOut}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-red-400"
              title="Sign out"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* LEFT: Upload (Scrollable) */}
        {/* Hidden on mobile unless toggled */}
        <section
          className={`
                flex-none flex flex-col border-b lg:border-b-0 lg:border-r border-white/5 bg-[#0f1115]/80 backdrop-blur-xl lg:bg-[#0f1115]/30 lg:backdrop-blur-sm z-30
                absolute inset-0 lg:static w-full lg:w-[360px] transition-transform duration-300 ease-in-out
                ${showMobileContext ? "translate-y-0" : "translate-y-full lg:translate-y-0 hidden lg:flex"}
            `}
        >
          {/* Mobile Header for Context Panel */}
          <div className="lg:hidden flex justify-between items-center p-4 border-b border-white/5">
            <h3 className="font-bold text-white">Context & Upload</h3>
            <button onClick={() => setShowMobileContext(false)} className="p-2 text-slate-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">

            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/5">
              <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <span className="text-lg">📄</span> Context
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload a PDF to establish context. I will answer your questions based strictly on this document.
              </p>
            </div>

            <FileUpload
              className="min-h-[220px] w-full"
              onFileUpload={setUploadedFile}
              currentFile={uploadedFile}
              showAskQuestion={false}
              navigateTo=""
            />

            {/* Document Info Card */}
            <div className="rounded-2xl bg-[#13161c]/80 border border-white/5 p-4 flex flex-col gap-3 shadow-lg">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-3">Active Document</p>
                <div className="flex items-center gap-3 text-slate-200 bg-white/5 p-2 rounded-lg border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <span className="font-medium truncate text-xs" title={activeDocumentName}>
                    {activeDocumentName}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="bg-black/20 rounded-lg p-2 text-center border border-white/5">
                  <p className="text-[9px] text-slate-500 uppercase">Status</p>
                  <p className="text-[10px] text-emerald-400 font-semibold">Ready</p>
                </div>
                <div className="bg-black/20 rounded-lg p-2 text-center border border-white/5">
                  <p className="text-[9px] text-slate-500 uppercase">Privacy</p>
                  <p className="text-[10px] text-purple-400 font-semibold">Encrypted</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* RIGHT: Chat (Flex Grow) */}
        <section className="flex-1 flex flex-col min-h-0 bg-transparent relative z-10">

          {/* Subtle Chat Header */}
          <header className="flex-none flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#0f1115]/40 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#1a1c23] border border-white/10 flex items-center justify-center shadow-md">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
                  <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                  <path d="M12 8v4" />
                  <path d="M12 14v8" />
                  <path d="M8 14h8" />
                  <path d="M16 18h2a2 2 0 0 1 2 2" />
                  <path d="M8 18H6a2 2 0 0 0-2 2" />
                </svg>
              </div>
              <div>
                <h2 className="text-xs font-bold text-white leading-tight uppercase tracking-wide">
                  AI Assistant
                </h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                  <p className="text-[10px] text-slate-400 font-medium">Online & Ready</p>
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 relative overflow-hidden">
            <ChatInterface
              documentName={uploadedFile?.name || user?.document?.name}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Chat;

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import FileUpload from "../components/FileUpload";
import ChatInterface from "../components/ChatInterface";
import { useNavigate } from "react-router-dom";

import useVantaGlobe from "../hooks/useVantaGlobe";
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

  const [signoutUser] = useSignoutMutation();
  const navigate = useNavigate();


  // Shared Vanta Globe hook
  // const vantaRef = useVantaGlobe();

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
    <div className="relative h-screen w-full overflow-hidden font-montserrat text-white selection:bg-purple-500/30 flex flex-col">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} onPurrAssist={handlePurrAssist} />

      {/* FIXED BACKGROUND */}
      {/* <div ref={vantaRef} className="fixed inset-0 pointer-events-none" /> */}

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
              Private Workspace
            </p>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
              Chat with Your Documents
            </h1>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-6">
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

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* LEFT: Upload (Scrollable) */}
        <section className="w-full lg:w-[350px] xl:w-[400px] flex-none flex flex-col border-b lg:border-b-0 lg:border-r border-white/5 bg-[#0f1115]/40 backdrop-blur-sm">
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
            <header>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">📄</span>
                <h2 className="text-lg font-bold text-white">
                  Source Document
                </h2>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload a PDF to establish context. I will answer your questions based strictly on this document.
              </p>
            </header>

            <FileUpload
              className="min-h-[220px] w-full"
              onFileUpload={setUploadedFile}
              currentFile={uploadedFile}
              showAskQuestion={false}
              navigateTo=""
            />

            {/* Document Info Card */}
            <div className="rounded-2xl bg-[#13161c]/60 border border-white/5 p-5 flex flex-col gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Current Context</p>
                <div className="flex items-center gap-3 text-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <span className="font-medium truncate text-sm" title={activeDocumentName}>
                    {activeDocumentName}
                  </span>
                </div>
              </div>

              <div className="h-px bg-white/5" />

              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Status</span>
                  <span className="text-emerald-400 font-medium">Ready to chat</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Privacy</span>
                  <span>Encrypted & Private</span>
                </div>
              </div>
            </div>

            {/* Footer Text */}
            <div className="mt-auto pt-6 text-[10px] uppercase tracking-widest text-slate-600 text-center">
              Purr Assist AI System
            </div>
          </div>
        </section>

        {/* RIGHT: Chat (Flex Grow) */}
        <section className="flex-1 flex flex-col min-h-0 bg-transparent relative">
          {/* Chat Header */}
          <header className="flex-none flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0f1115]/60 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                AI
              </div>
              <div>
                <h2 className="text-sm font-bold text-white leading-tight">
                  Assistant
                </h2>
                <p className="text-[10px] text-slate-400">
                  Always active
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Context Aware</span>
            </div>
          </header>

          <div className="flex-1 relative overflow-hidden bg-[#0f1115]/30">
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

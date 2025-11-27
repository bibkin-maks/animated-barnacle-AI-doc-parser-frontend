import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import FileUpload from "../components/FileUpload";
import ChatInterface from "../components/ChatInterface";
import { useNavigate } from "react-router-dom";

import useVantaGlobe from "../hooks/useVantaGlobe";

// ========================================================================
// Chat Component
// ========================================================================
const Chat = () => {
  const { user, token, logout } = useAuth();
  const [uploadedFile, setUploadedFile] = useState(null);
  const navigate = useNavigate();

  // Shared Vanta Globe hook
  const vantaRef = useVantaGlobe();

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const handleSignOut = async () => {
    if (!token) return;

    try {
      await fetch(`${import.meta.env.VITE_SERVER_URL}/signout/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
    } catch {
      console.warn("Signout failed.");
    }

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

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden overflow-y-auto">

      {/* FIXED BACKGROUND */}
      <div
        ref={vantaRef}
        className="fixed inset-0 -z-10 w-full h-full pointer-events-none"
      />

      {/* Ambient blurry lights */}
      <div className="pointer-events-none fixed inset-0 -z-5">
        <div className="absolute -top-40 -left-32 w-96 h-96 bg-purple-700 opacity-30 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-120px] right-[-60px] w-[420px] h-[420px] bg-cyan-500 opacity-25 blur-[150px] rounded-full" />
      </div>

      {/* Page Content */}
      <div className="relative z-10 flex flex-col items-center px-4 py-10 text-white font-montserrat w-full">

        {/* Top bar */}
        <header className="w-full max-w-6xl flex items-center justify-between mb-8">
          <div className="flex flex-col gap-1">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-300/70">
              Your private workspace
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-50">
              Chat with Your Documents
            </h1>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Welcome back
                </p>
                <p className="text-sm font-semibold">
                  {firstName}{" "}
                  <span className="text-xs text-emerald-400">● Premium</span>
                </p>
              </div>

              <button
                onClick={handleSignOut}
                className="
                  px-4 py-2 rounded-full border border-red-400/60 
                  text-red-300 text-sm font-medium
                  bg-red-500/5 backdrop-blur-md
                  hover:bg-red-500/15 hover:border-red-300
                  transition
                "
              >
                Sign out
              </button>
            </div>
          )}
        </header>

        {/* Main layout */}
        <main
          className="
            w-full max-w-6xl
            rounded-3xl border border-white/10
            bg-white/5 backdrop-blur-2xl
            shadow-[0_0_40px_rgba(15,23,42,0.8)]
            p-6 md:p-8
            flex flex-col lg:flex-row gap-8
          "
        >
          {/* LEFT: Upload */}
          <section className="w-full lg:w-1/3 flex flex-col gap-6">
            <header>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300/70 mb-2">
                Document
              </p>
              <h2 className="text-xl font-semibold text-slate-50 mb-1">
                Your source of truth
              </h2>
              <p className="text-xs text-slate-300/80 leading-relaxed">
                Upload a PDF — I will answer only using its content.
              </p>
            </header>

            <FileUpload
              className="h-[150px] w-full"
              onFileUpload={setUploadedFile}
              currentFile={uploadedFile}
              showAskQuestion={false}
            />

            <div className="mt-2 rounded-2xl bg-slate-900/60 border border-slate-700/60 px-4 py-3 text-xs text-slate-300/90 flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Linked file</span>
                <span className="text-slate-100 font-medium truncate">
                  {activeDocumentName}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px] mt-1">
                <span>Privacy</span>
                <span>Stored securely to your account only</span>
              </div>
            </div>
          </section>

          {/* RIGHT: Chat */}
          <section className="w-full lg:w-2/3">
            <header className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300/70">
                  Conversation
                </p>
                <h2 className="text-lg font-semibold text-slate-50">
                  Ask anything about your document
                </h2>
              </div>

              <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-300/80 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700/70">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>AI ready · context-aware</span>
              </div>
            </header>

            <ChatInterface
              documentName={uploadedFile?.name || user?.document?.name}
            />
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-6 text-xs text-slate-400/80">
          Built for focus — every chat stays private.
        </footer>
      </div>
    </div>
  );
};

export default Chat;

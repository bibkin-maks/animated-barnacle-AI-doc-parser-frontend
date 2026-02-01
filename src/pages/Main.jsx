import React, { useCallback } from "react";
import UploadBox from "../components/FileUpload";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useVantaGlobe from "../hooks/useVantaGlobe";
import { PurrAssistLogo } from "../assets/svgAssets";

// ========================================================
// Navbar
// ========================================================
function Navbar({ onLogin, isAuthed, user }) {
  const navigate = useNavigate();

  return (
    <nav className="w-full flex justify-between items-center py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-20">

      {/* Logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg group hover:border-purple-500/50 transition-colors">
          <PurrAssistLogo className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white drop-shadow-md">
          ChatDoc
        </span>
      </div>

      {/* Right side */}
      <div className="flex gap-4 items-center">
        {isAuthed ? (
          <div className="flex items-center gap-4">
            {/* Simple Avatar Representation */}
            <div
              className="hidden sm:flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={onLogin}
            >
              <div className="text-right leading-none">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">My Account</p>
                <p className="text-sm font-semibold text-white">{user?.name?.split(' ')[0]}</p>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-inner border border-white/10">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={onLogin}
              className="text-slate-300 hover:text-white transition-colors text-sm font-medium px-2"
            >
              Login
            </button>
            <button
              onClick={onLogin}
              className="
                bg-purple-600 hover:bg-purple-500 text-white 
                px-5 py-2 rounded-full 
                shadow-[0_0_15px_rgba(147,51,234,0.5)] hover:shadow-[0_0_25px_rgba(147,51,234,0.7)]
                transition-all duration-300
                text-sm font-bold
              "
            >
              Get Started
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

// ========================================================
// Hero text
// ========================================================
function HeroText({ onLogin, isAuthed, className = "" }) {
  return (
    <div className={`flex flex-col gap-6 text-white ${className}`}>

      {/* Badge */}
      <div className="inline-flex items-center gap-2 self-center lg:self-start bg-white/5 border border-white/10 rounded-full px-3 py-1 backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#a3a3a3]">
          Feature Update
        </span>
        <span className="text-[10px] font-bold tracking-wide text-white">
          Multi-Format Support
        </span>
      </div>

      {/* Headline */}
      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-center lg:text-left drop-shadow-2xl">
        Chat with your <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-white">
          documents.
        </span>
      </h1>

      {/* Benefits */}
      <p className="text-slate-200 text-lg lg:text-xl font-medium leading-relaxed text-center lg:text-left max-w-xl mx-auto lg:mx-0">
        Get instant answers, summaries, and citations from your PDFs, Word docs, and text files.
      </p>

      {/* Subtext */}
      <p className="text-slate-400 text-sm leading-relaxed text-center lg:text-left max-w-md mx-auto lg:mx-0">
        Stop scrolling. Start chatting. Just upload a file and ask away.
      </p>


      {/* Main CTA (Only if Not logged in) */}
      {!isAuthed && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
          <button
            onClick={onLogin}
            className="
                bg-white text-black px-8 py-3.5 rounded-full 
                font-bold text-base
                hover:scale-105 transition-transform duration-300
                shadow-[0_0_20px_rgba(255,255,255,0.3)]
              "
          >
            Start for free
          </button>
          <button
            className="
                px-8 py-3.5 rounded-full 
                font-bold text-base text-white
                border border-white/20 hover:bg-white/5
                backdrop-blur-sm transition-all
              "
          >
            View Demo
          </button>
        </div>
      )}

      {/* Stats Pill */}
      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-8 opacity-80 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-6 h-6 rounded-full bg-slate-700 border border-[#0f1115]" />
            ))}
          </div>
          <p className="text-xs font-medium text-slate-300">
            Trusted by <span className="text-white font-bold">10,000+</span> professionals
          </p>
        </div>
        <div className="h-1 w-1 rounded-full bg-slate-600 hidden sm:block" />
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          99% Accuracy
        </p>
      </div>

    </div>
  );
}

// ========================================================
// Main Page
// ========================================================
export default function Main() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const isAuthed = Boolean(token && user);

  // const vantaRef = useVantaGlobe();

  const handleLogin = useCallback(
    (e) => {
      e?.preventDefault();
      navigate(isAuthed ? "/chat" : "/login");
    },
    [navigate, isAuthed]
  );

  return (
    <div className="relative min-h-screen w-full font-montserrat overflow-x-hidden text-white bg-transparent selection:bg-purple-500/30">

      {/* Backgrounds */}

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar onLogin={handleLogin} isAuthed={isAuthed} user={user} />

        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 lg:py-0">

          {/* Main Glass Container */}
          <div
            className="
                w-full max-w-7xl 
                bg-[#0f1115]/60 backdrop-blur-3xl 
                border border-white/10 rounded-[2.5rem] 
                shadow-2xl 
                p-8 md:p-12 lg:p-16
                grid lg:grid-cols-2 gap-12 lg:gap-20 items-center
             "
          >

            {/* Left Col */}
            <HeroText
              onLogin={handleLogin}
              isAuthed={isAuthed}
              user={user}
            />

            {/* Right Col */}
            <div className="relative w-full max-w-md mx-auto lg:max-w-full lg:ml-auto perspective-1000">
              {/* Decorative glowing blob behind card */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-purple-600/30 blur-[100px] rounded-full -z-10 animate-pulse-slow" />

              <div
                className="
                    relative
                    bg-[#13161c]/40 backdrop-blur-md 
                    border border-white/10 rounded-3xl 
                    shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)]
                    hover:shadow-[0_30px_60px_-12px_rgba(147,51,234,0.15)]
                    transition-shadow duration-500
                    p-2 z-10
                  "
              >
                <UploadBox
                  navigateTo={isAuthed ? "/chat" : "/login"}
                  className="w-full h-[450px] bg-transparent border-0 shadow-none !backdrop-blur-none"
                />
              </div>
            </div>

          </div>
        </main>

        {/* Footer */}
        <footer className="w-full py-6 text-center text-xs text-slate-500/60 uppercase tracking-widest border-t border-white/5 bg-[#0f1115]/80 backdrop-blur-sm">
          Purr Assist AI • 2025
        </footer>

      </div>
    </div>
  );
}

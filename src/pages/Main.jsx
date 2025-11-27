import React, { useCallback } from "react";
import UploadBox from "../components/FileUpload";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useVantaGlobe from "../hooks/useVantaGlobe";

// ========================================================
// Navbar
// ========================================================
function Navbar({ onLogin, isAuthed, user }) {
  return (
    <nav className="w-full flex justify-between items-center py-4 px-4 sm:px-6 lg:px-8 text-white max-w-7xl mx-auto">

      {/* Logo */}
      <div className="flex items-center gap-2 text-lg sm:text-xl font-bold tracking-tight">
        <span role="img" aria-label="logo">💬</span> ChatDoc
      </div>

      {/* Right side */}
      <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm opacity-90 items-center">

        {isAuthed ? (
          <>
            <span className="hidden sm:inline">
              Hi, <span className="font-semibold">{user?.name || "there"}</span> 👋
            </span>

            <button
              onClick={onLogin}
              className="bg-purple-600 px-4 py-1 rounded-full hover:bg-purple-700 transition"
            >
              Open Chat
            </button>
          </>
        ) : (
          <>
            <button onClick={onLogin} className="hover:text-purple-400 transition">
              Login
            </button>
            <button onClick={onLogin} className="hover:text-purple-400 transition hidden sm:inline">
              Sign Up
            </button>

            <button className="bg-purple-600 px-4 py-1 rounded-full hover:bg-purple-700 transition">
              My Projects
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
function HeroText({ onLogin, isAuthed, user, className = "" }) {
  return (
    <div className={`flex flex-col gap-6 text-white ${className}`}>
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
        AI THAT READS <br />
        <span className="text-purple-400">YOUR FILES</span>
      </h1>

      <div className="w-full flex justify-center lg:justify-start">
        <p className="opacity-80 leading-relaxed text-sm sm:text-base sm:w-4/5">
          Our AI-powered document assistant instantly reads, understands, and summarizes your files —
          so you don’t have to. Upload PDFs, essays, reports, or notes, and let the system extract key
          information, answer questions, and provide clear insights in seconds.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 sm:gap-4 mt-2 justify-center lg:justify-start">
        <button
          onClick={onLogin}
          className="bg-blue-600 px-6 py-2 rounded-xl text-white text-sm sm:text-base font-semibold hover:bg-blue-700 transition"
        >
          {isAuthed ? "Open Chat →" : "Sign Up →"}
        </button>

        <button className="border border-gray-500 px-6 py-2 rounded-xl text-white text-sm font-semibold hover:border-white transition">
          My Projects →
        </button>
      </div>

      <hr className="w-1/2 mx-auto lg:mx-0 mt-6 opacity-30" />

      <div className="flex flex-wrap gap-8 sm:gap-16 mt-6 opacity-75 text-sm justify-center lg:justify-start">
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold">10+</span> MB uploads
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold">0.5s</span> response time
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold">5</span> free chats
        </div>
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

  // Shared Vanta hook
  const vantaRef = useVantaGlobe();

  const handleLogin = useCallback(
    (e) => {
      e.preventDefault();
      navigate(isAuthed ? "/chat" : "/login");
    },
    [navigate, isAuthed]
  );

  return (
    <div ref={vantaRef} className="min-h-screen w-full font-montserrat relative overflow-x-hidden">

      <div className="relative z-10 flex flex-col min-h-screen">

        <Navbar onLogin={handleLogin} isAuthed={isAuthed} user={user} />

        <main className="flex-1 flex justify-center px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div
            className="
              w-full max-w-7xl
              rounded-3xl border border-white/10
              bg-white/5 backdrop-blur-2xl
              shadow-[0_0_40px_rgba(15,23,42,0.8)]
              px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20
              py-8 sm:py-10 lg:py-16
              flex flex-col lg:flex-row
              gap-10 lg:gap-16
              items-center lg:items-start

              h-[1000px]  lg:h-[700px]
            "
          >
            <HeroText
              onLogin={handleLogin}
              isAuthed={isAuthed}
              user={user}
              className="w-full lg:max-w-xl text-center lg:text-left"
            />

            <div className="w-full lg:flex-1 flex justify-center lg:justify-end">
              <UploadBox
                navigateTo={isAuthed ? "/chat" : "/login"}
                className="
                  bg-[#080D12] rounded-2xl
                  p-6 sm:p-8
                  h-[320px] sm:h-[380px] lg:h-[450px]
                  max-w-md lg:max-w-lg lg:w-full
                "
              />
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}

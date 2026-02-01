import React, { useCallback } from "react";
import UploadBox from "../components/FileUpload";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PurrAssistLogo } from "../assets/svgAssets";
import { motion } from "framer-motion";

// Landing Sections
import Features from "../components/landing/Features";
import Pricing from "../components/landing/Pricing";
import Team from "../components/landing/Team";
import Trust from "../components/landing/Trust";

// ========================================================
// Navbar
// ========================================================
function Navbar({ onLogin, isAuthed, user }) {
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full flex justify-between items-center py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-20 relative"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg transition-all duration-300 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/30 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]">
          <PurrAssistLogo className="w-6 h-6 text-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white drop-shadow-md group-hover:text-cyan-400 transition-colors">
          ChatDoc
        </span>
      </div>

      {/* Right side */}
      <div className="flex gap-4 items-center">
        {isAuthed ? (
          <div className="flex items-center gap-4">
            <div
              className="hidden sm:flex items-center gap-3 cursor-pointer group"
              onClick={onLogin}
            >
              <div className="text-right leading-none">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5 group-hover:text-cyan-400 transition-colors">Welcome back</p>
                <p className="text-sm font-semibold text-white group-hover:text-cyan-100 transition-colors">{user?.name?.split(' ')[0]}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border border-white/20 group-hover:scale-110 transition-transform duration-300">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        ) : (
          <>
            <button
              onClick={onLogin}
              className="text-slate-300 hover:text-white transition-colors text-sm font-medium px-4 py-2 hover:bg-white/5 rounded-full"
            >
              Login
            </button>
            <button
              onClick={onLogin}
              className="
                relative overflow-hidden
                bg-white text-black 
                px-6 py-2.5 rounded-full 
                shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]
                transition-all duration-300 hover:scale-105 active:scale-95
                text-sm font-bold group
              "
            >
              <span className="relative z-10 group-hover:text-cyan-900 transition-colors">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </>
        )}
      </div>
    </motion.nav>
  );
}

// ========================================================
// Hero text
// ========================================================
function HeroText({ onLogin, isAuthed, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      className={`flex flex-col gap-8 text-white ${className}`}
    >

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="inline-flex items-center gap-2 self-center lg:self-start bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md shadow-lg shadow-black/20"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
          Feature Update
        </span>
        <span className="w-px h-3 bg-white/10" />
        <span className="text-[10px] font-bold tracking-wide text-cyan-400">
          Multi-Format Support
        </span>
      </motion.div>

      {/* Headline */}
      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-center lg:text-left drop-shadow-2xl">
        Chat with your <br />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 animate-gradient-x">
          documents.
        </span>
      </h1>

      {/* Benefits */}
      <p className="text-slate-300 text-lg lg:text-xl font-medium leading-relaxed text-center lg:text-left max-w-xl mx-auto lg:mx-0">
        Unlock instant answers, summaries, and citations from your files using AI.
      </p>

      {/* Main CTA (Only if Not logged in) */}
      {!isAuthed && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
          <button
            onClick={onLogin}
            className="
                group relative bg-white text-black px-8 py-4 rounded-full 
                font-bold text-base overflow-hidden
                hover:scale-105 transition-all duration-300
                shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(34,211,238,0.3)]
              "
          >
            <span className="relative z-10 group-hover:text-cyan-950 transition-colors">Start for free</span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>

          <button
            className="
                group px-8 py-4 rounded-full 
                font-bold text-base text-white
                border border-white/20 hover:bg-white/5
                backdrop-blur-sm transition-all duration-300
                flex items-center gap-2 justify-center
              "
          >
            <span>View Demo</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      )}

      {/* Stats Pill */}
      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-4 opacity-80 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
            {[1, 2, 3].map(i => (
              <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#0f1115] bg-gradient-to-br from-slate-700 to-slate-800 shadow-md transform hover:-translate-y-1 transition-transform`} />
            ))}
          </div>
          <p className="text-xs font-medium text-slate-300">
            Trusted by <span className="text-white font-bold">10,000+</span> pros
          </p>
        </div>
      </div>

    </motion.div>
  );
}

// ========================================================
// Main Page
// ========================================================
export default function Main() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const isAuthed = Boolean(token && user);

  const handleLogin = useCallback(
    (e) => {
      e?.preventDefault();
      navigate(isAuthed ? "/chat" : "/login");
    },
    [navigate, isAuthed]
  );

  return (
    <div className="relative min-h-screen w-full font-montserrat overflow-x-hidden text-white bg-transparent selection:bg-cyan-500/30">

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar onLogin={handleLogin} isAuthed={isAuthed} user={user} />

        <main className="flex-1 flex flex-col items-center w-full">

          {/* Hero Section */}
          <div className="w-full px-4 sm:px-6 py-12 lg:py-0 flex items-center justify-center min-h-[90vh]">
            {/* Main Glass Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="
                  w-full max-w-7xl 
                  bg-black/30 backdrop-blur-2xl 
                  border border-white/10 rounded-[3rem] 
                  shadow-2xl 
                  p-8 md:p-12 lg:p-20
                  grid lg:grid-cols-2 gap-12 lg:gap-24 items-center relative overflow-hidden
               "
            >
              {/* Subtle Gradient Glow inside container */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />

              {/* Left Col */}
              <HeroText
                onLogin={handleLogin}
                isAuthed={isAuthed}
                user={user}
                className="relative z-10"
              />

              {/* Right Col */}
              <motion.div
                initial={{ opacity: 0, x: 30, rotate: 2 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                className="relative w-full max-w-md mx-auto lg:max-w-full lg:ml-auto perspective-1000 z-10"
              >
                {/* Decorative elements behind card */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 blur-[80px] rounded-full -z-10 animate-pulse-slow" />

                <div
                  className="
                      relative
                      bg-[#13161c]/60 backdrop-blur-md 
                      border border-white/10 rounded-[2rem]
                      shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]
                      hover:shadow-[0_20px_50px_-12px_rgba(34,211,238,0.15)]
                      transition-all duration-500 hover:scale-[1.01] hover:-translate-y-1
                      p-3
                    "
                >
                  <UploadBox
                    navigateTo={isAuthed ? "/chat" : "/login"}
                    className="w-full h-[500px] bg-transparent border-0 shadow-none !backdrop-blur-none"
                  />
                </div>
              </motion.div>

            </motion.div>
          </div>

          {/* Scroll Down Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-500 text-sm tracking-widest hidden lg:block"
          >
            SCROLL TO EXPLORE
          </motion.div>

          {/* New Sections */}
          <Features />
          <Trust />
          <Pricing />
          <Team />

        </main>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="w-full py-12 text-center border-t border-white/5 bg-black/40 backdrop-blur-xl"
        >
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 mb-12 text-left">
            <div>
              <h4 className="text-white font-bold mb-4">ChatDoc</h4>
              <p className="text-slate-500 text-sm">Transforming documents into intelligence.</p>
            </div>
            <div>
              <h5 className="text-white font-bold mb-4">Product</h5>
              <ul className="space-y-2 text-slate-500 text-sm">
                <li className="hover:text-cyan-400 cursor-pointer">Features</li>
                <li className="hover:text-cyan-400 cursor-pointer">Pricing</li>
                <li className="hover:text-cyan-400 cursor-pointer">API</li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-4">Company</h5>
              <ul className="space-y-2 text-slate-500 text-sm">
                <li className="hover:text-cyan-400 cursor-pointer">About Us</li>
                <li className="hover:text-cyan-400 cursor-pointer">Careers</li>
                <li className="hover:text-cyan-400 cursor-pointer">Legal</li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-4">Connect</h5>
              <ul className="space-y-2 text-slate-500 text-sm">
                <li className="hover:text-cyan-400 cursor-pointer">Twitter</li>
                <li className="hover:text-cyan-400 cursor-pointer">LinkedIn</li>
                <li className="hover:text-cyan-400 cursor-pointer">GitHub</li>
              </ul>
            </div>
          </div>
          <p className="text-slate-600 text-[10px] uppercase tracking-[0.2em]">
            © 2025 Purr Assist AI Inc. All rights reserved.
          </p>
        </motion.footer>

      </div>
    </div>
  );
}

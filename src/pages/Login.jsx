import React, { useEffect, useCallback } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

import useVantaGlobe from "../hooks/useVantaGlobe";

// ========================================================================
// Login Page
// ========================================================================

export default function Login() {
  const navigate = useNavigate();
  const { login, user, token } = useAuth();

  // const vantaRef = useVantaGlobe();

  // Redirect if user is already authenticated
  useEffect(() => {
    if (token && user) {
      navigate("/chat");
    }
  }, [token, user, navigate]);

  // Handle Google login
  const handleLogin = useCallback(
    async (googleResponse) => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/userauth/`,
          { token: googleResponse.credential }
        );

        const { user, token } = response.data;

        login(user, token);
        navigate("/chat");
      } catch (error) {
        console.error("Login failed:", error);
      }
    },
    [login, navigate]
  );

  return (
    <div
      // ref={vantaRef}
      className="
        min-h-screen w-full relative font-montserrat overflow-hidden
        flex items-center justify-center px-4 bg-transparent
      "
    >

      {/* Login Card */}
      <main
        className="
          relative z-10 w-full max-w-md
          bg-white/10 backdrop-blur-2xl
          border border-white/15 shadow-[0_0_60px_rgba(0,0,0,0.4)]
          rounded-3xl p-10 flex flex-col items-center
        "
      >
        {/* Title */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-300 text-sm">
            Sign in to access your AI-powered document workspace
          </p>
        </header>

        {/* Google Login */}
        <div className="scale-110 mb-6">
          <GoogleLogin
            onSuccess={handleLogin}
            onError={() => console.log("Google Login failed")}
            theme="filled_black"
            size="large"
            shape="rectangular"
            width="100%"
            useOneTap={false}
          />
        </div>

        {/* Divider */}
        <div className="w-full flex items-center gap-4 my-6">
          <div className="flex-1 h-[1px] bg-white/20" />
          <span className="text-white/40 text-xs uppercase tracking-wide">
            Or
          </span>
          <div className="flex-1 h-[1px] bg-white/20" />
        </div>

        {/* Info */}
        <p className="text-[13px] text-slate-300 text-center">
          You will automatically be redirected to your chat after signing in.
          <br />
          <span className="text-[11px] text-slate-400">
            No password required — verified via Google.
          </span>
        </p>
      </main>
    </div>
  );
}

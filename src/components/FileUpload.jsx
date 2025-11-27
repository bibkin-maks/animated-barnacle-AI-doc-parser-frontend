import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function FileUpload({ className = "", showAskQuestion = true, navigateTo = "" }) {
  const { token, user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [localFile, setLocalFile] = useState(null);
  const storedFileName = user?.document?.name || null;

  useEffect(() => {
    if (!storedFileName) setLocalFile(null);
  }, [storedFileName]);

  const handleUpload = useCallback(async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    await fetch(`${import.meta.env.VITE_SERVER_URL}/upload/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    await refreshUser();

    if (navigateTo) navigate(navigateTo);
  }, [token, refreshUser, navigateTo]);

  const onDrop = useCallback((accepted) => {
    if (!token) {
      navigate("/login");
      return;
    }

    const file = accepted[0];
    if (file) {
      setLocalFile(file);
      handleUpload(file);
    }
  }, [token, handleUpload]);

  const removeFile = useCallback(async () => {
    await fetch(`${import.meta.env.VITE_SERVER_URL}/removefile/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    setLocalFile(null);
    await refreshUser();
  }, [token, refreshUser]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [] },
    maxFiles: 1,
    onDrop,
    disabled: !!storedFileName,
  });

  return (
    <div className={`flex flex-col items-center ${className}`}>

      {/* DROP AREA ONLY */}
      <div
        {...getRootProps()}
        className={`
          w-full h-full flex flex-col justify-center items-center 
          rounded-2xl border-2 border-dashed cursor-pointer transition
          
          ${isDragActive
            ? "border-blue-300 bg-white/5"
            : storedFileName
            ? "border-green-400 bg-white/5"
            : "border-slate-500/40 bg-white/5 hover:bg-white/10"}
        `}
      >
        <input {...getInputProps()} />

        {!storedFileName && (
          <div className="flex flex-col items-center">
            <div className="text-5xl mb-4">☁️</div>
            <p className="text-center text-[15px] opacity-85">
              {isDragActive ? "Drop your PDF..." : "Drag & drop or click to choose"}
            </p>
          </div>
        )}

        {storedFileName && (
          <span className="text-sm opacity-80 truncate px-4">{storedFileName}</span>
        )}
      </div>

      {/* ACTION BUTTONS — NOT INSIDE DROPZONE */}
      {storedFileName && (
        <div className="flex gap-3 mt-4">
          <button
            onClick={removeFile}
            className="px-4 py-2 rounded-xl border border-red-300/50 text-red-300"
          >
            Remove
          </button>

          {showAskQuestion && (
            <button
              onClick={() => navigate("/chat")}
              className="px-4 py-2 rounded-xl border border-blue-300/50 text-blue-300"
            >
              Ask a Question
            </button>
          )}
        </div>
      )}
    </div>
  );
}

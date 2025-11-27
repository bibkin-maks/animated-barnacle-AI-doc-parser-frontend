import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function FileUpload({ className = "" , showAskQuestion = true, navigateTo = ""}) {
  const { token, user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [localFile, setLocalFile] = useState(null);

  const storedFileName = user?.document?.name || null;

  useEffect(() => {
    if (!storedFileName) setLocalFile(null);
  }, [storedFileName]);

  const handleUpload = useCallback(
    async (file) => {
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/upload/`, {
          method: "POST",
          body: formData,
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`Upload error: ${res.status}`);

        console.log("Upload success:", await res.json());
      } catch (err) {
        console.error("Upload error:", err);
      }

    
      await refreshUser();

      if (navigateTo != "") {
        navigate(navigateTo);
      }
    },
    [token, refreshUser]
  );

  const onDrop = useCallback(
    (accepted) => {
      const file = accepted[0];
      if (file) {
        setLocalFile(file);
        handleUpload(file);
      }
    },
    [handleUpload]
  );

  const removeFile = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/removefile/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Delete error: ${res.status}`);

      console.log("Delete success:", await res.json());
    } catch (err) {
      console.error("Delete error:", err);
    }

    setLocalFile(null);
    await refreshUser();
  }, [token, refreshUser]);

  // Dropzone config
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [] },
    maxFiles: 1,
    onDrop,
    disabled: !!storedFileName, // disable if user already has file
  });

  return (
    <div
      {...getRootProps()}
      className={`

        flex flex-col justify-center items-center
        transition-all duration-300 cursor-pointer 
        backdrop-blur-xl rounded-2xl max-w-lg mx-auto text-white
        shadow-[0_0_40px_rgba(88,28,135,0.15)]
        font-[Montserrat]
        border-2 border-dashed
        
        ${
          isDragActive
            ? "border-blue-300 bg-white/5 shadow-[0_0_50px_rgba(147,197,253,0.25)]"
            : storedFileName
            ? "border-green-300 bg-white/5"
            : "border-slate-500/40 bg-white/5 hover:bg-white/10 hover:-translate-y-1 hover:shadow-[0_0_50px_rgba(147,197,253,0.2)]"
        }
        ${className}
      `}
    >
      <input {...getInputProps()} />

      {!storedFileName ? (
        <div className="flex flex-col items-center ">
          <div className="text-5xl mb-4">☁️</div>
          <p className="text-center text-[15px] opacity-85 leading-relaxed">
            {isDragActive ? "Drop your PDF here..." : "Drag & drop your PDF, or click to select"}
            <br />
            <span className="text-[12px] opacity-60">Max size: 10MB</span>
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-3">
          <div className="relative max-w-[340px] text-center opacity-90 flex items-center gap-2 text-sm ">
            <span className=" truncate">{storedFileName}</span>
          </div>

          <button
            onClick={removeFile}
            className="
              px-4 py-2 rounded-xl border border-red-300/50 
              text-red-300 bg-red-300/10 text-sm transition
              hover:bg-red-300/20 hover:text-white 
              w-[180px] text-center
            "
          >
            Remove
          </button>

          {showAskQuestion && <button
            className="
              px-4 py-2 rounded-xl border border-blue-300/50 
              text-blue-300 bg-blue-300/10 text-sm transition
              hover:bg-blue-300/20 hover:text-white
              w-[180px] text-center
            "
            onClick={() => navigate("/chat")}
          >
            Ask A Question
          </button>
          }
        </div>
      )}
    </div>
  );
}

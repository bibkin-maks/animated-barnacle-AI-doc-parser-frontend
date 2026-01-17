import { useDropzone } from "react-dropzone";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useUploadFileMutation, useRemoveFileMutation } from "../slices/apiSlice";

export default function FileUpload({ className = "", showAskQuestion = true, navigateTo = "" }) {
  const { user, refreshUser } = useAuth();
  const [uploadFile] = useUploadFileMutation();
  const [removeFile] = useRemoveFileMutation();

  const navigate = useNavigate();

  const storedFileName = user?.document?.name || null;

  const onDrop = async (accepted) => {
    const file = accepted[0];
    if (!file) return;
    else {
      const formData = new FormData();
      formData.append("file", file);

      await uploadFile(formData);
      await refreshUser();

      if (navigateTo !== "") {
        navigate(navigateTo);
      }
    }
  }

  const handleRemove = async () => {
    await removeFile();
    await refreshUser();
  }

  // Dropzone config
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [], "text/plain": [], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [] },
    maxFiles: 1,
    onDrop,
    disabled: !!storedFileName,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        group relative
        flex flex-col justify-center items-center
        transition-all duration-500 ease-out cursor-pointer 
        backdrop-blur-xl rounded-2xl max-w-lg mx-auto text-white
        font-[Montserrat]
        border-2 border-dashed
        overflow-hidden
        ${isDragActive
          ? "border-purple-400 bg-purple-500/10 shadow-[0_0_50px_rgba(168,85,247,0.3)] scale-[1.02]"
          : storedFileName
            ? "border-emerald-400/50 bg-emerald-500/5"
            : "border-slate-500/30 bg-white/5 hover:bg-purple-900/5 hover:border-purple-400/50 hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]"
        }
        ${className}
      `}
    >
      <input {...getInputProps()} />

      {!storedFileName ? (
        <div className="flex flex-col items-center z-10 p-8 space-y-5">
          {/* Animated Icon */}
          <div className={`
             w-16 h-16 rounded-full flex items-center justify-center
             bg-gradient-to-br from-purple-500/20 to-blue-500/20
             border border-white/10
             transition-transform duration-500 group-hover:scale-110
             ${isDragActive ? "animate-bounce" : ""}
          `}>
            <svg
              className={`w-8 h-8 text-purple-300 transition-all duration-300 group-hover:text-purple-200 ${!isDragActive && "group-hover:-translate-y-1"}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
<<<<<<< Updated upstream

          <div className="text-center space-y-2">
            <p className="text-lg font-medium tracking-tight text-white group-hover:text-purple-100 transition-colors">
              {isDragActive ? "Drop to upload!" : "Drop a PDF here to start chatting"}
            </p>
            <p className="text-sm text-slate-400">
              or click to upload (max 10MB)
            </p>
          </div>

          <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-slate-500 font-semibold pt-2">
            <span>PDF</span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span>DOCX</span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span>TXT</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 space-y-6 w-full h-full">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-2xl">
              📄
            </div>
            <p className="text-sm font-medium text-emerald-100/90 truncate max-w-[280px]">
              {storedFileName}
            </p>
          </div>

          <div className="flex gap-3 w-full max-w-[280px]">
            <button
              onClick={(e) => { e.stopPropagation(); handleRemove(); }}
              className="flex-1 py-2.5 rounded-lg border border-red-400/30 text-red-300 hover:bg-red-500/10 transition text-xs font-semibold uppercase tracking-wide"
            >
              Remove
            </button>

            {showAskQuestion && (
              <button
                onClick={(e) => { e.stopPropagation(); navigate("/chat"); }}
                className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20 transition text-xs font-bold uppercase tracking-wide"
              >
                Start Chat
              </button>
            )}
=======
          <div className="flex flex-wrap justify-center gap-3 w-full">
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
>>>>>>> Stashed changes
          </div>
        </div>
      )}
    </div>
  );
}

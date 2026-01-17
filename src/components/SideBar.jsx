import { useState, useEffect } from "react";
import { PurrAssistLogo } from "../assets/svgAssets";
import { useNavigate } from "react-router-dom";

// Local classnames helper instead of `clsx`
const cx = (...args) => args.filter(Boolean).join(" ");

// Simplified icons for menu items
const Icons = {
  NewChat: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Search: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Uploads: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Close: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Notes: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Calendar: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
};

export default function Sidebar({ isOpen, onToggle, onPurrAssist }) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  useEffect(() => {
    // Simulate fetching data with a slight delay
    const t = setTimeout(() => {
      setProjects([
        { id: "1", name: "New project?", color: "#ef4444" }, // red-500
        { id: "2", name: "Website development", color: "#f97316" }, // orange-500
      ]);

      setNotes([
        { id: "1", title: "Job finding progress" },
        { id: "2", title: "Training check-ins" },
        { id: "3", title: "Trip planning" },
        { id: "4", title: "Application process tracking" },
        { id: "5", title: "Python learning" },
      ]);
    }, 500);

    return () => clearTimeout(t);
  }, []);

  const handlePurr = () => {
    if (typeof onPurrAssist === "function") onPurrAssist();
  };

  return (
    <>
      {/* Backdrop for mobile (optional, but good for UX) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={cx(
          "fixed top-0 left-0 h-screen z-50 transition-transform duration-300 ease-out",
          "w-[320px] sm:w-[350px]",
          "bg-[#0f1115]/90 backdrop-blur-2xl border-r border-white/10",
          "flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2">
          {/* Logo Container */}
          <div
            className={cx(
              "relative cursor-pointer transition-transform duration-300",
              isLogoHovered && "scale-105"
            )}
            onMouseEnter={() => setIsLogoHovered(true)}
            onMouseLeave={() => setIsLogoHovered(false)}
          >
            <PurrAssistLogo className="w-10 h-10" />
          </div>

          {/* Close Button */}
          <button
            onClick={onToggle}
            className="p-2 -mr-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <Icons.Close />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 space-y-8 custom-scrollbar">

          {/* Main Action Button */}
          <button
            onClick={() => navigate("/purr-assist")}
            className="
              group w-full relative overflow-hidden
              bg-gradient-to-r from-purple-600/20 to-blue-600/20 
              hover:from-purple-600/30 hover:to-blue-600/30
              border border-white/10 hover:border-white/20
              rounded-xl p-4 transition-all duration-300
              flex items-center gap-3
            "
          >
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white group-hover:text-purple-100 transition-colors">
                Purr Assist
              </p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                AI Assistant
              </p>
            </div>
          </button>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-1">
            {[
              { label: "New chat", icon: Icons.NewChat, action: () => navigate("/chat") },
              { label: "Notes", icon: Icons.Notes, action: () => navigate("/notes") },
              { label: "Calendar", icon: Icons.Calendar, action: () => navigate("/calendar") },
              { label: "Search", icon: Icons.Search },
              { label: "Uploads", icon: Icons.Uploads },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-slate-300 hover:text-white hover:bg-white/5
                  transition-all duration-200 group
                "
              >
                <span className="text-slate-500 group-hover:text-purple-400 transition-colors">
                  <item.icon />
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Separator */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Projects Section */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-4 px-2">
              Projects
            </h3>
            <div className="flex flex-col gap-2">
              {projects.map((project) => (
                <button
                  key={project.id}
                  className="
                    flex items-center gap-3 px-3 py-2 rounded-lg
                    border border-transparent hover:border-white/5 hover:bg-white/5
                    transition-all duration-200 group w-full text-left
                  "
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px] transition-opacity"
                    style={{ backgroundColor: project.color, boxShadow: `0 0 8px ${project.color}` }}
                  />
                  <span className="text-sm text-slate-300 group-hover:text-white truncate">
                    {project.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes Section */}
          <div className="pb-10">
            <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-4 px-2">
              Recent Notes
            </h3>
            <div className="flex flex-col gap-1">
              {notes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => navigate("/notes")}
                  className="
                    px-3 py-2 rounded-lg text-left w-full
                    text-sm text-slate-400 hover:text-white hover:bg-white/5
                    transition-all duration-200 truncate
                  "
                >
                  {note.title}
                </button>
              ))}
            </div>
          </div>

        </div>
      </aside>
    </>
  );
}

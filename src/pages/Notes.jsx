
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import useVantaGlobe from "../hooks/useVantaGlobe";
import Sidebar from "../components/SideBar";
import {
    useSignoutUserMutation,
    useGetNotebooksQuery,
    useCreateNotebookMutation,
    useDeleteNotebookMutation,
    useUpdateNotebookMutation,
    useGetNotesQuery,
    useCreateNoteMutation,
    useUpdateNoteMutation,
    useDeleteNoteMutation
} from "../slices/apiSlice";

import RichTextEditor from "../components/RichTextEditor";

const DEBOUNCE_DELAY = 1000;

export default function Notes() {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    // const vantaRef = useVantaGlobe();

    // Auth & Navigation
    const [signoutUser] = useSignoutUserMutation();
    const handleSignOut = async () => {
        if (!token) return;
        await signoutUser(JSON.stringify({ token }));
        logout();
        navigate("/login");
    };

    const handlePurrAssist = useCallback(() => {
        setIsSidebarOpen(false);
        navigate("/chat");
    }, [navigate]);

    // UI State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = useCallback(() => setIsSidebarOpen((s) => !s), []);
    const [selectedNotebookId, setSelectedNotebookId] = useState(null);
    const [selectedNoteId, setSelectedNoteId] = useState(null);
    const [isCreatingNotebook, setIsCreatingNotebook] = useState(false);
    const [newNotebookName, setNewNotebookName] = useState("");
    const [editingNotebookId, setEditingNotebookId] = useState(null);
    const [editingNotebookName, setEditingNotebookName] = useState("");

    // API Hooks
    const { data: notebooks = [], isLoading: isLoadingNotebooks } = useGetNotebooksQuery(undefined, { skip: !token });
    const { data: notes = [], isLoading: isLoadingNotes } = useGetNotesQuery(selectedNotebookId, { skip: !selectedNotebookId });

    const [createNotebook] = useCreateNotebookMutation();
    const [updateNotebook] = useUpdateNotebookMutation();
    const [deleteNotebook] = useDeleteNotebookMutation();
    const [createNote] = useCreateNoteMutation();
    const [updateNote] = useUpdateNoteMutation();
    const [deleteNote] = useDeleteNoteMutation();

    // Select first notebook by default if none selected
    useEffect(() => {
        if (!selectedNotebookId && notebooks.length > 0) {
            setSelectedNotebookId(notebooks[0].id);
        }
    }, [notebooks, selectedNotebookId]);

    // Local state for active note editing to avoid laggy typing
    const [activeNoteTitle, setActiveNoteTitle] = useState("");
    const [activeNoteContent, setActiveNoteContent] = useState("");
    const [charCount, setCharCount] = useState(0); // Track filtered text count
    const [lastSaved, setLastSaved] = useState(null);

    // Sync selected note to local state
    // ... (Existing useEffect for sync) ...

    // Auto-save logic
    // ... (Existing useEffect for auto-save) ...

    <div className="flex-1 relative overflow-hidden flex flex-col">
        <RichTextEditor
            content={activeNoteContent}
            onChange={setActiveNoteContent}
            onStatsChange={setCharCount}
            className="w-full h-full border-0 rounded-none bg-transparent"
        />
    </div>

    // Handlers
    const handleCreateNotebook = async (e) => {
        e.preventDefault();
        if (!newNotebookName.trim()) return;
        try {
            const result = await createNotebook({ name: newNotebookName }).unwrap();
            setSelectedNotebookId(result.id);
            setNewNotebookName("");
            setIsCreatingNotebook(false);
        } catch (error) {
            console.error("Failed to create notebook", error);
        }
    };

    const handleUpdateNotebook = async (e) => {
        e.preventDefault();
        if (!editingNotebookName.trim()) return;
        try {
            await updateNotebook({ id: editingNotebookId, name: editingNotebookName }).unwrap();
            setEditingNotebookId(null);
            setEditingNotebookName("");
        } catch (error) {
            console.error("Failed to update notebook", error);
        }
    };

    const handleDeleteNotebook = async (id, e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure? All notes in this notebook will be deleted.")) {
            try {
                await deleteNotebook(id).unwrap();
                if (selectedNotebookId === id) {
                    setSelectedNotebookId(null);
                    setSelectedNoteId(null);
                }
            } catch (error) {
                console.error("Failed to delete notebook", error);
            }
        }
    };

    const handleCreateNote = async () => {
        if (!selectedNotebookId) return;
        try {
            const result = await createNote({
                notebookId: selectedNotebookId,
                title: "New Note",
                content: ""
            }).unwrap();
            setSelectedNoteId(result.id);
        } catch (error) {
            console.error("Failed to create note", error);
        }
    };

    const handleDeleteNote = async (id, e) => {
        e.stopPropagation();
        if (window.confirm("Delete this note?")) {
            try {
                await deleteNote(id).unwrap();
                if (selectedNoteId === id) {
                    setSelectedNoteId(null);
                }
            } catch (error) {
                console.error("Failed to delete note", error);
            }
        }
    };


    const firstName = useMemo(
        () => user?.name?.split(" ")[0] || "there",
        [user]
    );

    return (
        <div className="relative h-screen w-full overflow-hidden font-montserrat text-white selection:bg-purple-500/30 flex flex-col">
            <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} onPurrAssist={handlePurrAssist} />

            {/* FIXED BACKGROUND */}
            {/* <div ref={vantaRef} className="fixed inset-0 pointer-events-none" /> */ /* REMOVED VANTA */}
            <div className="pointer-events-none fixed inset-0 -z-5">
                <div className="absolute -top-40 -left-32 w-96 h-96 bg-purple-700 opacity-20 blur-[130px] rounded-full" />
                <div className="absolute bottom-[-120px] right-[-60px] w-[420px] h-[420px] bg-cyan-500 opacity-15 blur-[150px] rounded-full" />
            </div>

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
                            Notes
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
                            className="px-4 py-2 rounded-full border border-red-400/30 text-red-300 text-xs font-bold uppercase tracking-wide bg-red-500/5 backdrop-blur-md hover:bg-red-500/15 hover:border-red-400/50 hover:text-red-200 transition-all duration-300"
                        >
                            Sign out
                        </button>
                    </div>
                )}
            </header>

            {/* Main Content Area */}
            <main className="relative z-10 flex-1 flex flex-col md:flex-row overflow-hidden bg-[#0f1115]/30">

                {/* LEFT COLUMN: Notebooks List */}
                <aside className="w-full md:w-[250px] lg:w-[280px] flex-none flex flex-col border-b md:border-b-0 md:border-r border-white/5 bg-[#0f1115]/60 backdrop-blur-sm z-20">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-xs uppercase tracking-widest text-slate-400 font-bold">Notebooks</h2>
                        <button
                            onClick={() => setIsCreatingNotebook(true)}
                            className="text-cyan-400 hover:text-cyan-300 transition-colors"
                            title="Create Notebook"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                    </div>

                    {isCreatingNotebook && (
                        <form onSubmit={handleCreateNotebook} className="p-2 border-b border-white/5 bg-white/5">
                            <input
                                autoFocus
                                type="text"
                                value={newNotebookName}
                                onChange={(e) => setNewNotebookName(e.target.value)}
                                placeholder="Notebook Name..."
                                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none mb-2"
                                onBlur={() => { if (!newNotebookName) setIsCreatingNotebook(false) }}
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setIsCreatingNotebook(false)} className="text-[10px] uppercase text-slate-400 hover:text-white">Cancel</button>
                                <button type="submit" disabled={!newNotebookName} className="text-[10px] uppercase text-cyan-400 hover:text-cyan-300 font-bold">Create</button>
                            </div>
                        </form>
                    )}

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {isLoadingNotebooks ? (
                            <div className="p-4 text-center text-slate-500 text-xs">Loading notebooks...</div>
                        ) : (
                            <ul className="flex flex-col">
                                {notebooks.map((nb) => (
                                    <li key={nb.id} className="group relative">
                                        {editingNotebookId === nb.id ? (
                                            <form onSubmit={handleUpdateNotebook} className="p-3 bg-white/5">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={editingNotebookName}
                                                    onChange={(e) => setEditingNotebookName(e.target.value)}
                                                    className="w-full bg-transparent text-sm text-white focus:outline-none"
                                                    onBlur={() => setEditingNotebookId(null)}
                                                />
                                            </form>
                                        ) : (
                                            <button
                                                onClick={() => setSelectedNotebookId(nb.id)}
                                                className={`w-full text-left p-3 text-sm font-medium transition-colors flex items-center justify-between ${selectedNotebookId === nb.id ? "bg-cyan-500/10 text-cyan-400 border-r-2 border-cyan-400" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                                            >
                                                <span className="truncate pr-2">{nb.name}</span>
                                                {selectedNotebookId === nb.id && (
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span
                                                            onClick={(e) => { e.stopPropagation(); setEditingNotebookId(nb.id); setEditingNotebookName(nb.name); }}
                                                            className="p-1 hover:text-white cursor-pointer" title="Rename"
                                                        >
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                                        </span>
                                                        <span
                                                            onClick={(e) => handleDeleteNotebook(nb.id, e)}
                                                            className="p-1 hover:text-red-400 cursor-pointer" title="Delete"
                                                        >
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                                        </span>
                                                    </div>
                                                )}
                                            </button>
                                        )}
                                    </li>
                                ))}
                                {notebooks.length === 0 && !isCreatingNotebook && (
                                    <div className="p-4 text-center text-slate-600 text-xs italic">No notebooks yet. Create one!</div>
                                )}
                            </ul>
                        )}
                    </div>
                </aside>


                {/* MIDDLE: Notes List */}
                <aside className={`w-full md:w-[250px] lg:w-[300px] flex-none flex flex-col border-b md:border-b-0 md:border-r border-white/5 bg-[#0f1115]/40 backdrop-blur-sm ${!selectedNotebookId ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="p-4 border-b border-white/5">
                        <button
                            onClick={handleCreateNote}
                            disabled={!selectedNotebookId}
                            className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg font-semibold shadow-lg shadow-purple-900/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>+</span> Create New Note
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        {isLoadingNotes ? (
                            <div className="text-center text-slate-500 text-xs mt-4">Loading notes...</div>
                        ) : notes.length === 0 ? (
                            <div className="text-center text-slate-600 text-xs mt-4">No notes in this notebook.</div>
                        ) : (
                            notes.map((note) => (
                                <div
                                    key={note.id}
                                    className={`group w-full text-left p-3 rounded-xl transition-all duration-200 border border-transparent cursor-pointer relative ${selectedNoteId === note.id ? "bg-white/10 text-white border-white/5 shadow-sm" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                                    onClick={() => setSelectedNoteId(note.id)}
                                >
                                    <p className="font-semibold truncate text-sm pr-6">{note.title || "Untitled"}</p>
                                    <p className="text-[10px] text-slate-500 mt-1 truncate">{note.content ? note.content.substring(0, 30) + "..." : "No content"}</p>

                                    <button
                                        onClick={(e) => handleDeleteNote(note.id, e)}
                                        className="absolute top-2 right-2 p-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete Note"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                {/* RIGHT: Editor Area */}
                <section className="flex-1 flex flex-col min-h-0 bg-transparent relative">
                    {selectedNoteId ? (
                        <>
                            <div className="flex-none p-6 md:p-8 border-b border-white/5 bg-[#0f1115]/20 backdrop-blur-sm">
                                <input
                                    type="text"
                                    value={activeNoteTitle}
                                    onChange={(e) => setActiveNoteTitle(e.target.value)}
                                    className="w-full bg-transparent text-3xl md:text-4xl font-bold text-white placeholder-slate-600 focus:outline-none tracking-tight"
                                    placeholder="Note Title"
                                />
                                <div className="text-xs text-slate-500 mt-3 flex items-center gap-3 font-medium">
                                    {lastSaved ? (
                                        <span className="bg-white/5 px-2 py-1 rounded text-emerald-400/80">Saved {lastSaved.toLocaleTimeString()}</span>
                                    ) : (
                                        <span className="bg-white/5 px-2 py-1 rounded text-slate-400">Unsaved changes...</span>
                                    )}
                                    <span>•</span>
                                    <span>{charCount} characters (Text Only)</span>
                                </div>
                            </div>

                            <div className="flex-1 relative overflow-hidden flex flex-col">
                                <RichTextEditor
                                    content={activeNoteContent}
                                    onChange={setActiveNoteContent}
                                    className="w-full h-full border-0 rounded-none bg-transparent"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-600 flex-col gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            </div>
                            <p>Select a note to view or edit</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}


import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
    Book,
    Plus,
    Trash2,
    Edit2,
    FileText,
    Search,
    Menu,
    LogOut,
    ChevronRight,
    MoreVertical,
    MoreVertical,
    Settings,
    Star,
    Copy,
    FilePlus,
    CornerUpRight,
    ExternalLink,
    FolderInput,
    GripVertical
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import useResizeObserver from "../hooks/useResizeObserver";
import Sidebar from "../components/SideBar";
import {
    useSignoutMutation,
    useGetNotebooksQuery,
    useCreateNotebookMutation,
    useDeleteNotebookMutation,
    useUpdateNotebookMutation,
    useGetNotesQuery,
    useCreateNoteMutation,
    useUpdateNoteMutation,
    useDeleteNoteMutation,
    useReorderNotesMutation
} from "../slices/apiSlice";



import RichTextEditor from "../components/RichTextEditor";


const DEBOUNCE_DELAY = 1000;

export default function Notes() {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const urlNoteId = searchParams.get("noteId");

    // ... Existing refs ...
    // const vantaRef = useVantaGlobe();
    const [containerRef, { width, height }] = useResizeObserver();

    // Auth & Navigation
    const [signoutUser] = useSignoutMutation();
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
    const [reorderNotes] = useReorderNotesMutation();

    // Local state for reordering
    const [orderedNotes, setOrderedNotes] = useState([]);

    // Sync orderedNotes with fetched notes
    useEffect(() => {
        setOrderedNotes(notes);
    }, [notes]);

    // Handle Reorder Save (Debounced)
    useEffect(() => {
        if (orderedNotes.length === 0 || !selectedNotebookId) return;

        const currentIds = orderedNotes.map(n => n.id).join(',');
        const originalIds = notes.map(n => n.id).join(',');

        if (currentIds !== originalIds && orderedNotes.length === notes.length) {
            const timer = setTimeout(() => {
                const payload = orderedNotes.map((n, i) => ({ id: n.id, order: i }));
                reorderNotes({ notebookId: selectedNotebookId, notes: payload });
            }, 800); // 800ms debounce
            return () => clearTimeout(timer);
        }
    }, [orderedNotes, notes, selectedNotebookId, reorderNotes]);

    // Select first notebook by default if none selected, OR handle URL noteId
    useEffect(() => {
        if (urlNoteId && notebooks.length > 0 && notes.length > 0) {
            // If URL has noteId, find which notebook it belongs to
            // Flatten all notes from all notebooks? 
            // Limitation: We only fetch notes for *selected* notebook currently.
            // Problem: We need to know which notebook the note is in to select it.
            // Workaround: We might need to iterate or fetch all notes?
            // For now, let's assume we might need to search or just rely on user context.
            // Actually, `useGetNotesQuery(selectedNotebookId)` implies we don't have all notes.
            // We can iterate notebooks and find it, BUT we don't have notes for unselected notebooks loaded.
            // Solution: We'll skip deep linking across notebooks for this iteration unless we fetch all.
            // But wait, the notes array depends on selectedNotebookId.
            // If we want to link a note, we need the notebook ID in the URL too or fetch global.
            // Let's assume we trust the user opens the right notebook or we add ?notebookId=xyz param.

            // NOTE: Current implementation only loads notes for selectedNotebookId.
            // If we want deep linking to work reliably, we should add notebookId to URL.
        }

        if (!selectedNotebookId && notebooks.length > 0) {
            setSelectedNotebookId(notebooks[0].id);
        }
    }, [notebooks, selectedNotebookId, urlNoteId]);

    // Additional Effect for URL handling if we change the route structure later
    useEffect(() => {
        if (urlNoteId && selectedNotebookId) {
            // If we are in a notebook, check if note exists here.
            // We can't clear selectedNotebookId here easily without context.
            // Ideally we'd do: /notebooks/:notebookId/notes/:noteId
        }
        if (urlNoteId && notes.find(n => n.id === urlNoteId)) {
            setSelectedNoteId(urlNoteId);
        }
    }, [urlNoteId, notes, selectedNotebookId]);

    // Local state for active note editing to avoid laggy typing
    const [activeNoteTitle, setActiveNoteTitle] = useState("");
    const [activeNoteContent, setActiveNoteContent] = useState("");
    const [charCount, setCharCount] = useState(0); // Track filtered text count
    const [lastSaved, setLastSaved] = useState(null);

    // Sync selected note to local state
    const lastSyncedId = useRef(null);
    useEffect(() => {
        if (selectedNoteId && notes.length > 0) {
            const note = notes.find(n => n.id === selectedNoteId);
            if (note && lastSyncedId.current !== selectedNoteId) {
                // Only sync if we switched to a new note (prevents overwriting unsaved edits)
                setActiveNoteTitle(note.title || "");
                setActiveNoteContent(note.content || "");
                lastSyncedId.current = selectedNoteId;
            }
        } else if (!selectedNoteId) {
            lastSyncedId.current = null;
        }
    }, [selectedNoteId, notes]);

    // Auto-save logic
    useEffect(() => {
        if (!selectedNoteId) return;

        const note = notes.find(n => n.id === selectedNoteId);
        // Note: checking against note.title/content avoids saving just-loaded data
        // But we must be careful: if note is undefined (not loaded), don't save.
        if (!note) return;

        // If content matches backend, don't auto-save
        if (note.title === activeNoteTitle && note.content === activeNoteContent) return;

        const handler = setTimeout(() => {
            updateNote({
                id: selectedNoteId,
                title: activeNoteTitle,
                content: activeNoteContent
            })
                .unwrap()
                .then(() => setLastSaved(new Date()))
                .catch(err => console.error("Auto-save failed", err));
        }, DEBOUNCE_DELAY);

        return () => clearTimeout(handler);
    }, [activeNoteTitle, activeNoteContent, selectedNoteId, updateNote]); // Intentionally omitting 'notes' to avoid race conditions

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

    const handleDeleteNote = useCallback(async (id, e) => {
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
    }, [deleteNote, selectedNoteId]);

    const handleToggleFavorite = async (noteId) => {
        const note = notes.find(n => n.id === noteId);
        if (!note) return;
        try {
            await updateNote({ id: noteId, isFavorite: !note.is_favorite }).unwrap();
        } catch (err) {
            console.error("Failed to toggle favorite", err);
        }
    };

    const handleDuplicateNote = async () => {
        if (!selectedNoteId || !selectedNotebookId) return;
        try {
            const note = notes.find(n => n.id === selectedNoteId);
            if (!note) return;
            const result = await createNote({
                notebookId: selectedNotebookId,
                title: `${note.title} (Copy)`,
                content: note.content
            }).unwrap();
            setSelectedNoteId(result.id);
        } catch (err) {
            console.error("Failed to duplicate note", err);
        }
    };

    const handleMoveNote = async () => {
        if (!selectedNoteId) return;
        const targetNotebookName = prompt("Enter the exact name of the notebook to move to:");
        if (!targetNotebookName) return;

        const targetNotebook = notebooks.find(nb => nb.name === targetNotebookName);
        if (!targetNotebook) {
            alert("Notebook not found!");
            return;
        }

        try {
            await updateNote({ id: selectedNoteId, notebookId: targetNotebook.id }).unwrap();
            setSelectedNotebookId(targetNotebook.id); // Switch to that notebook to see the note
            // setSelectedNoteId(selectedNoteId); // Keep selection? Or might handle sync
        } catch (err) {
            console.error("Failed to move note", err);
        }
    };




    const firstName = useMemo(
        () => user?.name?.split(" ")[0] || "there",
        [user]
    );

    return (
        <div className="relative h-screen w-full overflow-hidden font-montserrat text-white bg-transparent selection:bg-cyan-500/30 flex">
            {/* Sidebar (Fixed) */}
            <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} onPurrAssist={handlePurrAssist} />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col relative z-10 h-full overflow-hidden">
                {/* Header */}
                <header className="flex-none h-16 w-full flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-all duration-300"
                        >
                            <Menu size={20} />
                        </button>
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold">Workspace</p>
                            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                Notes <span className="text-white/20">/</span> <span className="text-white/60 text-base font-normal">{notebooks.find(n => n.id === selectedNotebookId)?.name || 'Select Notebook'}</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {user && (
                            <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-medium text-slate-300">
                                    {firstName}
                                </span>
                            </div>
                        )}
                        <button
                            onClick={handleSignOut}
                            className="p-2 rounded-full hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                            title="Sign Out"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </header>

                {/* Content Grid */}
                <main className="flex-1 p-6 pt-2 overflow-hidden flex gap-6">

                    {/* LEFT PANEL: Notebooks */}
                    <motion.aside
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-[260px] flex-none flex flex-col gap-4"
                    >
                        {/* Notebook Actions */}
                        <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Notebooks</h2>
                                <button
                                    onClick={() => setIsCreatingNotebook(true)}
                                    className="text-cyan-400 hover:text-cyan-300 transition-transform hover:scale-110"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>

                            {/* Create Notebook Input */}
                            <AnimatePresence>
                                {isCreatingNotebook && (
                                    <motion.form
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        onSubmit={handleCreateNotebook}
                                        className="overflow-hidden"
                                    >
                                        <input
                                            autoFocus
                                            type="text"
                                            value={newNotebookName}
                                            onChange={(e) => setNewNotebookName(e.target.value)}
                                            placeholder="Name..."
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors mb-2"
                                            onBlur={() => { if (!newNotebookName) setIsCreatingNotebook(false) }}
                                        />
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Notebook List */}
                        <div className="flex-1 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                                {isLoadingNotebooks ? (
                                    <div className="p-4 text-center text-slate-500 text-xs">Loading...</div>
                                ) : (
                                    notebooks.map((nb) => (
                                        <div key={nb.id} className="relative group">
                                            {editingNotebookId === nb.id ? (
                                                <form onSubmit={handleUpdateNotebook} className="p-2">
                                                    <input
                                                        autoFocus
                                                        value={editingNotebookName}
                                                        onChange={(e) => setEditingNotebookName(e.target.value)}
                                                        className="w-full bg-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none"
                                                        onBlur={() => setEditingNotebookId(null)}
                                                    />
                                                </form>
                                            ) : (
                                                <button
                                                    onClick={() => setSelectedNotebookId(nb.id)}
                                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between group-hover:bg-white/5 ${selectedNotebookId === nb.id
                                                        ? "bg-cyan-500/10 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                                                        : "text-slate-400"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <Book size={14} className={selectedNotebookId === nb.id ? "text-cyan-400" : "text-slate-500"} />
                                                        <span className="truncate">{nb.name}</span>
                                                    </div>
                                                </button>
                                            )}

                                            {selectedNotebookId === nb.id && (
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-sm rounded-lg p-1">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setEditingNotebookId(nb.id); setEditingNotebookName(nb.name); }}
                                                        className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors"
                                                    >
                                                        <Edit2 size={12} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteNotebook(nb.id, e)}
                                                        className="p-1.5 hover:bg-red-500/20 rounded-md text-slate-400 hover:text-red-400 transition-colors"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.aside>

                    {/* MIDDLE PANEL: Notes List */}
                    <motion.aside
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className={`w-[280px] flex-none flex flex-col rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden ${!selectedNotebookId ? 'opacity-50 pointer-events-none grayscale' : ''}`}
                    >
                        <div className="p-4 border-b border-white/5 flex flex-col gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search notes..."
                                    className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:bg-white/10 transition-colors"
                                />
                            </div>
                            <button
                                onClick={handleCreateNote}
                                disabled={!selectedNotebookId}
                                className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <Plus size={16} /> <span>New Note</span>
                            </button>
                        </div>

                        <Reorder.Group
                            axis="y"
                            values={orderedNotes}
                            onReorder={setOrderedNotes}
                            className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 relative"
                            ref={containerRef}
                        >
                            {isLoadingNotes ? (
                                <div className="text-center text-slate-500 text-xs mt-8">Loading notes...</div>
                            ) : orderedNotes.length === 0 ? (
                                <div className="text-center text-slate-600 text-xs mt-8 flex flex-col items-center gap-2">
                                    <FileText size={24} className="opacity-20" />
                                    <span>No notes found</span>
                                </div>
                            ) : (
                                orderedNotes.map((note) => (
                                    <Reorder.Item
                                        key={note.id}
                                        value={note}
                                        onClick={() => setSelectedNoteId(note.id)}
                                        className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 border ${selectedNoteId === note.id
                                            ? "bg-white/10 border-white/10 shadow-lg"
                                            : "border-transparent hover:bg-white/5 hover:border-white/5"
                                            }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <div className="mt-1 text-slate-600 cursor-grab active:cursor-grabbing hover:text-slate-400 transition-colors">
                                                <GripVertical size={12} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <h3 className={`font-semibold text-sm truncate ${selectedNoteId === note.id ? 'text-white' : 'text-slate-300'}`}>
                                                        {note.title || "Untitled Note"}
                                                    </h3>
                                                    {note.is_favorite && <Star size={10} className="fill-amber-400 text-amber-400 flex-none" />}
                                                </div>
                                                <p className="text-[10px] text-slate-500 line-clamp-2">
                                                    {note.content?.replace(/<[^>]*>/g, '') || "No content"}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => handleDeleteNote(note.id, e)}
                                            className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all z-10"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </Reorder.Item>
                                ))
                            )}
                        </Reorder.Group>
                    </motion.aside>

                    {/* RIGHT PANEL: Editor */}
                    <motion.section
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex-1 flex flex-col min-h-0 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden"
                    >
                        {selectedNoteId && lastSyncedId.current === selectedNoteId ? (
                            <>
                                {/* Editor Header */}
                                <div className="flex-none px-8 py-6 border-b border-white/5">
                                    <input
                                        type="text"
                                        value={activeNoteTitle}
                                        onChange={(e) => setActiveNoteTitle(e.target.value)}
                                        className="w-full bg-transparent text-3xl font-bold text-white placeholder-slate-600 focus:outline-none tracking-tight"
                                        placeholder="Untitled Note"
                                    />
                                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 font-medium tracking-wide">
                                        <span className="flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${lastSaved ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                            {lastSaved ? `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Unsaved changes'}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                                        <span>{charCount} chars</span>

                                        {/* OPTIONS MENU */}
                                        <div className="ml-auto relative group z-50">
                                            <button className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                                                <MoreVertical size={16} />
                                            </button>

                                            <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1d24] border border-white/10 rounded-xl shadow-2xl p-1.5 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 transform origin-top-right z-50 flex flex-col gap-0.5">
                                                <button
                                                    onClick={() => handleToggleFavorite(selectedNoteId)}
                                                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                                                >
                                                    <Star size={14} className={notes.find(n => n.id === selectedNoteId)?.is_favorite ? "fill-amber-400 text-amber-400" : ""} />
                                                    {notes.find(n => n.id === selectedNoteId)?.is_favorite ? "Remove from Favorites" : "Add to Favorites"}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(`${window.location.origin}/notes?noteId=${selectedNoteId}`);
                                                        alert("Link copied!");
                                                    }}
                                                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                                                >
                                                    <Copy size={14} /> Copy link
                                                </button>
                                                <button
                                                    onClick={handleDuplicateNote}
                                                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                                                >
                                                    <FilePlus size={14} /> Duplicate
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        const newName = prompt("Rename note:", activeNoteTitle);
                                                        if (newName) setActiveNoteTitle(newName);
                                                    }}
                                                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                                                >
                                                    <Edit2 size={14} /> Rename
                                                </button>
                                                <button
                                                    onClick={handleMoveNote}
                                                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                                                >
                                                    <FolderInput size={14} /> Move to
                                                </button>
                                                <div className="h-px bg-white/10 my-1" />
                                                <button
                                                    onClick={(e) => handleDeleteNote(selectedNoteId, e)}
                                                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                                                >
                                                    <Trash2 size={14} /> Move to Trash
                                                </button>
                                                <div className="h-px bg-white/10 my-1" />
                                                <button
                                                    onClick={() => window.open(`/notes?noteId=${selectedNoteId}`, '_blank')}
                                                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                                                >
                                                    <ExternalLink size={14} /> Open in new tab
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Editor Content */}
                                <div className="flex-1 relative overflow-hidden">
                                    <RichTextEditor
                                        key={selectedNoteId} // Force remount to reset editor content
                                        content={activeNoteContent}
                                        onChange={setActiveNoteContent}
                                        onStatsChange={setCharCount}
                                        className="w-full h-full border-none bg-transparent"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4 opacity-50">
                                {selectedNoteId ? (
                                    <div className="animate-pulse">Loading note...</div>
                                ) : (
                                    <>
                                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                                            <FileText size={40} strokeWidth={1} />
                                        </div>
                                        <p className="text-sm font-medium tracking-widest uppercase">Select a note to begin</p>
                                    </>
                                )}
                            </div>
                        )}
                    </motion.section>

                </main>
            </div>
        </div>
    );
}


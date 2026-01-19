import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import { useSelector, useDispatch } from 'react-redux';
import { setEvents, selectEvents } from '../slices/calendarSlice';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import Sidebar from '../components/SideBar';
import { useAuth } from '../context/AuthContext';

// Use Moment.js localizer - Rock solid stability for Week/Day views
const localizer = momentLocalizer(moment);

const DnDCalendar = withDragAndDrop(Calendar);

// Luxury Glass Toolbar
const CustomToolbar = ({
    onNavigate,
    date,
    view,
    onView,
    filterType, setFilterType,
    filterStatus, setFilterStatus,
    searchQuery, setSearchQuery,
    // New Props for Undo/Redo & Bulk
    undo, redo, historyIndex, history,
    selectedEvents, onBulkDelete, onBulkStatusChange, onClearSelection,
    onJumpToDate
}) => {
    const goToBack = () => onNavigate('PREV');
    const goToNext = () => onNavigate('NEXT');
    const goToCurrent = () => onNavigate('TODAY');

    // Dynamic label based on view
    const getLabel = () => {
        const mDate = moment(date);
        if (view === 'month') return mDate.format('MMMM YYYY');
        if (view === 'week') return `${mDate.startOf('week').format('MMM D')} - ${mDate.endOf('week').format('MMM D')}`;
        if (view === 'day') return mDate.format('dddd, MMM D');
        return mDate.format('MMMM YYYY');
    };

    return (
        <div className="flex flex-col gap-4 mb-6 mx-4 z-20 relative">
            {/* Top Row: Navigation & Views */}
            <div className="flex flex-col md:flex-row items-center justify-between p-1.5 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                {/* Navigation */}
                <div className="flex items-center gap-2 pl-2 md:w-1/3">
                    <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/5">
                        <button onClick={goToBack} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-300 transition-all hover:text-white">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                        </button>
                        <button onClick={goToCurrent} className="px-4 text-sm font-bold text-white tracking-wide hover:text-cyan-400 transition-colors uppercase whitespace-nowrap">
                            {getLabel()}
                        </button>

                        {/* Jump to Date Picker */}
                        <div className="relative group mr-1">
                            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-300 transition-all hover:text-cyan-400">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </button>
                            <input
                                type="date"
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                value={moment(date).format('YYYY-MM-DD')}
                                onChange={(e) => {
                                    if (e.target.value && onJumpToDate) {
                                        onJumpToDate(new Date(e.target.value));
                                    }
                                }}
                                title="Jump to specific date"
                            />
                        </div>
                        <button onClick={goToNext} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-300 transition-all hover:text-white">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                        </button>
                        {/* Undo/Redo Controls */}
                        <div className="flex items-center gap-1 ml-2 border-l border-white/10 pl-2">
                            <button
                                onClick={undo}
                                disabled={historyIndex < 0}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-300 transition-all hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Undo (Ctrl+Z)"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9h13a5 5 0 010 10H7M3 9l4-4M3 9l4 4" /></svg>
                            </button>
                            <button
                                onClick={redo}
                                disabled={historyIndex >= history.length - 1 || history.length === 0}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-300 transition-all hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Redo (Ctrl+Y)"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 9H8a5 5 0 100 10h10M21 9l-4-4M21 9l-4 4" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* View Switcher */}
                <div className="flex items-center justify-end pr-2 md:w-1/3">
                    <div className="flex items-center bg-black/30 p-1 rounded-full border border-white/5">
                        {[Views.MONTH, Views.WEEK, Views.DAY].map(v => (
                            <button
                                key={v}
                                onClick={() => onView(v)}
                                className={`
                                    px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300
                                    ${view === v
                                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}
                                `}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-4 px-2">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                    <input
                        type="text"
                        placeholder="Search events..."
                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Type Filter */}
                <div className="flex bg-black/20 p-1 rounded-xl border border-white/10">
                    {[{ id: 'all', label: 'All' }, { id: 'task', icon: '📝' }, { id: 'project', icon: '🚀' }, { id: 'expense', icon: '💰' }, { id: 'workout', icon: '💪' }].map(type => (
                        <button
                            key={type.id}
                            onClick={() => setFilterType(type.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === type.id ? 'bg-white/10 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                            title={type.label || type.id}
                        >
                            {type.icon || type.label}
                        </button>
                    ))}
                </div>

                {/* Status Filter */}
                <div className="flex bg-black/20 p-1 rounded-xl border border-white/10">
                    {[{ id: 'all', label: 'All' }, { id: 'pending', color: 'text-yellow-400' }, { id: 'in_progress', color: 'text-blue-400' }, { id: 'completed', color: 'text-green-400' }].map(status => (
                        <button
                            key={status.id}
                            onClick={() => setFilterStatus(status.id)}
                            className={`w-6 h-6 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${filterStatus === status.id ? 'bg-white/10 shadow' : 'opacity-50 hover:opacity-100'}`}
                            title={status.label || status.id}
                        >
                            <div className={`w-2 h-2 rounded-full ${status.color || 'bg-white'} ${filterStatus === status.id ? 'scale-125' : ''}`} />
                        </button>
                    ))}
                </div>
                {/* Bulk Actions Toolbar */}
                {selectedEvents && selectedEvents.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl animate-in fade-in zoom-in-95 duration-200">
                        <span className="text-xs font-bold text-amber-400 whitespace-nowrap">
                            {selectedEvents.length} selected
                        </span>
                        <div className="h-4 w-px bg-amber-500/20 mx-1"></div>
                        <div className="flex gap-1">
                            <button onClick={() => onBulkStatusChange('completed')} className="px-2 py-1 text-[10px] font-bold bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors">Done</button>
                            <button onClick={() => onBulkStatusChange('pending')} className="px-2 py-1 text-[10px] font-bold bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors">Pending</button>
                            <button onClick={onBulkDelete} className="px-2 py-1 text-[10px] font-bold bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">Delete</button>
                            <button onClick={onClearSelection} className="px-2 py-1 text-[10px] font-bold bg-white/10 text-slate-400 rounded-lg hover:bg-white/20 transition-colors">Clear</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Replace the problematic recurrence rules with optimized version
// Replace the problematic recurrence rules with optimized version
const generateRecurringEvents = (baseEvent, recurrenceType, count) => {
    // Limits: If "End Date" is specified, we rely on the date check.
    // If NO "End Date" is specified, we use these "Safe Max" limits to prevent infinite loops.
    // These are set high enough (e.g., 5 years) to feel "unlimited" for typical usage.
    const safeLimits = {
        'daily': { unit: 'days', safeMax: 365 * 5 }, // 5 years
        'weekly': { unit: 'weeks', safeMax: 52 * 5 }, // 5 years
        'biweekly': { unit: 'weeks', safeMax: 26 * 5 }, // 5 years
        'monthly': { unit: 'months', safeMax: 12 * 5 }, // 5 years
        'yearly': { unit: 'years', safeMax: 10 } // 10 years
    };

    const rule = safeLimits[recurrenceType];
    if (!rule) return [];

    const instances = [];
    const recurrenceEnd = baseEvent.recurrenceEnd ? new Date(baseEvent.recurrenceEnd) : null;

    // Safety Break to prevent browser hang if logic fails
    // We use the count override if provided, otherwise the safeMax
    const maxInstances = count || rule.safeMax;

    for (let i = 1; i <= maxInstances; i++) {
        const nextStart = new Date(baseEvent.start);
        const nextEnd = new Date(baseEvent.end);

        if (rule.unit === 'days') {
            nextStart.setDate(nextStart.getDate() + i);
            nextEnd.setDate(nextEnd.getDate() + i);
        } else if (rule.unit === 'weeks') {
            const weeksToAdd = recurrenceType === 'biweekly' ? i * 2 : i;
            nextStart.setDate(nextStart.getDate() + (weeksToAdd * 7));
            nextEnd.setDate(nextEnd.getDate() + (weeksToAdd * 7));
        } else if (rule.unit === 'months') {
            nextStart.setMonth(nextStart.getMonth() + i);
            nextEnd.setMonth(nextEnd.getMonth() + i);
        } else if (rule.unit === 'years') {
            nextStart.setFullYear(nextStart.getFullYear() + i);
            nextEnd.setFullYear(nextEnd.getFullYear() + i);
        }

        // STOP CONDITION 1: Specific End Date Reached
        if (recurrenceEnd && nextStart > recurrenceEnd) {
            break;
        }

        // STOP CONDITION 2: If no end date, we just hit the maxInstances loop limit naturally.

        // Create a more unique ID to avoid collisions
        const uniqueId = `${baseEvent.id}_recur_${i}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        instances.push({
            ...baseEvent,
            id: uniqueId,
            start: new Date(nextStart),
            end: new Date(nextEnd),
            recurrence: baseEvent.recurrence,
            seriesId: baseEvent.seriesId,
            isInstance: true,
            recurrenceEnd: baseEvent.recurrenceEnd, // Propagate limit
            // Clear any existing instance-specific data
            workoutLog: baseEvent.workoutLog ? baseEvent.workoutLog.map(log => ({ ...log })) : []
        });
    }

    return instances;
};

export default function CalendarPage() {
    const dispatch = useDispatch();
    const events = useSelector(selectEvents);
    const [view, setView] = useState(Views.MONTH);
    const [date, setDate] = useState(new Date());

    const { user, userStorageKey } = useAuth();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);

    // Recurrence Modal State
    const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
    const [recurrenceAction, setRecurrenceAction] = useState(null); // 'edit' or 'delete'
    const [pendingEventData, setPendingEventData] = useState(null); // Data waiting to be saved

    const [newEvent, setNewEvent] = useState({
        title: "",
        description: "",
        start: new Date(),
        end: new Date(),
        allDay: false,
        repeatsYearly: false,
        recurrenceEnd: null,
        workoutLog: [] // Array of { name, sets, reps, comment }
    });

    const [templates, setTemplates] = useState([]);
    const [templateForm, setTemplateForm] = useState({
        name: "",
        exercises: [{ name: "", type: "count" }]
    });
    const [showTemplateModal, setShowTemplateModal] = useState(false);

    // Filter State
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // History & Selection
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [selectedEvents, setSelectedEvents] = useState([]);

    // Loading State
    const [isLoading, setIsLoading] = useState(false);

    // Dispatch with History Wrapper
    const dispatchWithHistory = useCallback((action, eventsBefore) => {
        // Clone events to avoid reference issues
        const beforeSnapshot = JSON.parse(JSON.stringify(eventsBefore));
        const afterSnapshot = action.payload ? JSON.parse(JSON.stringify(action.payload)) : [];

        const historyItem = {
            action: action.type,
            timestamp: new Date().toISOString(),
            before: beforeSnapshot,
            after: afterSnapshot
        };

        // Update history state
        setHistory(prev => {
            const newHistory = [...prev.slice(0, historyIndex + 1), historyItem];
            // Limit history to 50 items to prevent memory issues
            if (newHistory.length > 50) {
                return newHistory.slice(-50);
            }
            return newHistory;
        });
        setHistoryIndex(prev => {
            const newIndex = prev + 1;
            // Cap the index at history length
            const maxIndex = Math.min(newIndex, 49); // Since we limit to 50
            return maxIndex;
        });

        dispatch(action);
    }, [dispatch, historyIndex]);

    const undo = useCallback(() => {
        if (historyIndex >= 0 && history[historyIndex]) {
            const historyItem = history[historyIndex];
            dispatch(setEvents(historyItem.before));
            setHistoryIndex(prev => prev - 1);
        }
    }, [history, historyIndex, dispatch]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1 && history[historyIndex + 1]) {
            const historyItem = history[historyIndex + 1];
            dispatch(setEvents(historyItem.after));
            setHistoryIndex(prev => prev + 1);
        }
    }, [history, historyIndex, dispatch]);

    // Bulk Operations
    const handleBulkDelete = useCallback(() => {
        if (selectedEvents.length === 0) return;

        const updatedEvents = events.filter(e => !selectedEvents.includes(e.id));
        dispatchWithHistory(setEvents(updatedEvents), events);
        setSelectedEvents([]);
    }, [events, selectedEvents, dispatchWithHistory]);

    const handleBulkStatusChange = useCallback((status) => {
        if (selectedEvents.length === 0) return;

        const updatedEvents = events.map(event =>
            selectedEvents.includes(event.id)
                ? { ...event, status }
                : event
        );
        dispatchWithHistory(setEvents(updatedEvents), events);
    }, [events, selectedEvents, dispatchWithHistory]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Escape closes modals
            if (e.key === 'Escape') {
                if (showModal) setShowModal(false);
                if (showTemplateModal) setShowTemplateModal(false);
                if (showRecurrenceModal) setShowRecurrenceModal(false);
                return;
            }

            // Undo/Redo with Ctrl+Z/Ctrl+Y
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z' && !e.shiftKey) {
                    e.preventDefault();
                    undo();
                    return;
                }
                if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
                    e.preventDefault();
                    redo();
                    return;
                }
            }

            // Delete selected events
            if (e.key === 'Delete' && selectedEvents.length > 0) {
                e.preventDefault();
                handleBulkDelete();
                return;
            }

            // Search focus with Ctrl+F
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                const searchInput = document.querySelector('input[placeholder="Search events..."]');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
                return;
            }

            // Clear selection with Escape when no modals open
            if (e.key === 'Escape' && selectedEvents.length > 0) {
                if (!showModal && !showTemplateModal && !showRecurrenceModal) {
                    setSelectedEvents([]);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showModal, showTemplateModal, showRecurrenceModal, selectedEvents, undo, redo, handleBulkDelete]);

    // Derived State: Filtered Events with useMemo for performance
    // Lazy Loading / Windowing: Only render events within the current view range ±buffer
    const filteredEvents = useMemo(() => {
        // Calculate visible range with buffer (e.g., ±1 month for smooth navigation)
        // This simulates "lazy loading" by restricting the rendered dataset
        const mDate = moment(date);
        let start, end;

        // Determine buffer based on view
        if (view === Views.MONTH) {
            // Buffer: Previous month start to Next month end
            start = mDate.clone().subtract(1, 'month').startOf('month').toDate();
            end = mDate.clone().add(1, 'month').endOf('month').toDate();
        } else if (view === Views.WEEK) {
            // Buffer: Previous 2 weeks to Next 2 weeks
            start = mDate.clone().subtract(2, 'week').startOf('week').toDate();
            end = mDate.clone().add(2, 'week').endOf('week').toDate();
        } else {
            // Day View Buffer: ±1 week
            start = mDate.clone().subtract(1, 'week').startOf('week').toDate();
            end = mDate.clone().add(1, 'week').endOf('week').toDate();
        }

        return events.filter(event => {
            const matchesType = filterType === 'all' || event.type === filterType;
            const matchesStatus = filterStatus === 'all' || event.status === filterStatus;

            const matchesSearch = searchQuery ?
                event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase())) :
                true;

            // Date Range Check
            const eventStart = new Date(event.start);
            const eventEnd = new Date(event.end);
            // Check for overlap: Event End must be after Buffer Start AND Event Start before Buffer End
            const isInRange = eventEnd >= start && eventStart <= end;

            return matchesType && matchesStatus && matchesSearch && isInRange;
        });
    }, [events, filterType, filterStatus, searchQuery, date, view]);

    // Load templates from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem('workout_templates');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Migrating old string-only exercises to new object format if needed
                const migrated = parsed.map(t => ({
                    ...t,
                    exercises: t.exercises.map(ex => typeof ex === 'string' ? { name: ex, type: 'count' } : ex)
                }));
                setTemplates(migrated);
            } catch (e) { console.error("Failed templates load", e); }
        } else {
            // Default templates if none exist
            const defaults = [
                { id: 't1', name: 'Push Day', exercises: [{ name: 'Bench Press', type: 'count' }, { name: 'Overhead Press', type: 'count' }, { name: 'Incline Dumbbell', type: 'count' }, { name: 'Tricep Pushdowns', type: 'count' }] },
                { id: 't2', name: 'Pull Day', exercises: [{ name: 'Deadlift', type: 'count' }, { id: 'pullups', name: 'Pullups', type: 'count' }, { name: 'Barbell Rows', type: 'count' }, { name: 'Face Pulls', type: 'count' }, { name: 'Bicep Curls', type: 'count' }] },
                { id: 't3', name: 'Leg Day', exercises: [{ name: 'Squat', type: 'count' }, { name: 'Romanian Deadlift', type: 'count' }, { name: 'Leg Press', type: 'count' }, { name: 'Calf Raises', type: 'count' }] }
            ];
            setTemplates(defaults);
            localStorage.setItem('workout_templates', JSON.stringify(defaults));
        }
    }, []);

    const saveTemplate = () => {
        if (!templateForm.name) return;
        const exercises = templateForm.exercises.filter(ex => ex.name.trim() !== "");
        const newTemplate = {
            id: Date.now().toString(),
            name: templateForm.name,
            exercises: exercises
        };
        const updated = [...templates, newTemplate];
        setTemplates(updated);
        localStorage.setItem('workout_templates', JSON.stringify(updated));
        setTemplateForm({ name: "", exercises: [{ name: "", type: "count" }] });
    };

    const deleteTemplate = (id) => {
        const updated = templates.filter(t => t.id !== id);
        setTemplates(updated);
        localStorage.setItem('workout_templates', JSON.stringify(updated));
    };

    // Persist events to localStorage when they change
    useEffect(() => {
        if (userStorageKey) {
            localStorage.setItem(userStorageKey, JSON.stringify(events));
        }
    }, [events, userStorageKey]);

    // Load from LocalStorage with Migration and User Scoping
    useEffect(() => {
        if (!user || !userStorageKey) {
            return;
        }

        setIsLoading(true);

        // Check for legacy data to migrate
        const legacyData = localStorage.getItem('calendar_events');
        const userData = localStorage.getItem(userStorageKey);

        let sourceData = userData;

        // Migration logic
        if (!userData && legacyData) {
            sourceData = legacyData;
            localStorage.setItem(userStorageKey, legacyData);
            localStorage.removeItem('calendar_events');
        } else if (userData && legacyData) {
            localStorage.removeItem('calendar_events');
        }

        if (sourceData) {
            try {
                const parsed = JSON.parse(sourceData).map(evt => ({
                    ...evt,
                    start: new Date(evt.start),
                    end: new Date(evt.end),
                    // Migration: Default new fields if missing
                    type: evt.type || 'task',
                    status: evt.status || 'pending',
                    priority: evt.priority || 'medium',
                    amount: evt.amount || '',
                    workoutLog: (evt.workoutLog || []).map(log => ({
                        name: log.name || "",
                        type: log.type || "count",
                        sets: log.sets || "",
                        reps: log.reps || "",
                        comment: log.comment || "",
                        completed: log.completed || false,
                        value: log.value || ""
                    }))
                }));
                const validEvents = parsed.filter(e => !isNaN(e.start) && !isNaN(e.end));
                dispatch(setEvents(validEvents));
            } catch (e) {
                console.error("Failed to parse calendar events", e);
            }
        } else {
            dispatch(setEvents([]));
        }

        setIsLoading(false);
    }, [user, userStorageKey, dispatch]);

    const onEventResize = useCallback(
        ({ event, start, end }) => {
            const nextEvents = events.map((existingEvent) => {
                return existingEvent.id === event.id
                    ? { ...existingEvent, start: new Date(start), end: new Date(end) }
                    : existingEvent;
            });

            dispatchWithHistory(setEvents(nextEvents), events);
        },
        [events, dispatchWithHistory]
    );

    const onEventDrop = useCallback(
        ({ event, start, end, isAllDay: droppedOnAllDaySlot = false }) => {
            const { allDay } = event;

            // Create updated event
            const updatedEvent = {
                ...event,
                start: new Date(start),
                end: new Date(end),
                allDay: (!allDay && droppedOnAllDaySlot) ? true :
                    (allDay && !droppedOnAllDaySlot) ? false : allDay
            };

            const nextEvents = events.map((existingEvent) => {
                return existingEvent.id === updatedEvent.id ? updatedEvent : existingEvent;
            });

            dispatchWithHistory(setEvents(nextEvents), events);
        },
        [events, dispatchWithHistory]
    );

    const handleSelectSlot = (slotInfo) => {
        const start = new Date(slotInfo.start);
        const end = new Date(slotInfo.end);

        setNewEvent({
            title: "",
            description: "",
            start: start,
            end: end,
            allDay: slotInfo.action === 'doubleClick' || view === Views.MONTH ? true : false,
            recurrence: 'none',
            seriesId: null,
            type: 'task',
            status: 'pending',
            priority: 'medium',
            amount: '',
            workoutLog: []
        });

        setSelectedSlot(slotInfo);
        setShowModal(true);
    };

    // ------------------------------------------------------------------------
    // Recurrence Logic Handlers
    // ------------------------------------------------------------------------

    // 1. Intercept Save
    const handleSaveEvent = () => {
        if (!newEvent.title) return;

        // If it's an existing recurring event (has seriesId and is not just being created)
        // We need to ask the user what to do.
        if (newEvent.id && newEvent.seriesId) {
            setPendingEventData(newEvent);
            setRecurrenceAction('edit');
            setShowRecurrenceModal(true);
            return;
        }

        // Otherwise multiple scenarios:
        // A. New Event (Recurring or not) -> Just Save
        // B. Existing Non-Recurring Event -> Just Save
        executeSave(newEvent, 'single'); // Default scope
    };

    // 2. Intercept Delete
    const handleDeleteEvent = () => {
        if (!newEvent.id) return;

        if (newEvent.seriesId) {
            setPendingEventData(newEvent);
            setRecurrenceAction('delete');
            setShowRecurrenceModal(true);
            return;
        }

        executeDelete(newEvent, 'single');
    };

    // 3. Execute Save Logic (Split from handler)
    const executeSave = (eventToSave, scope) => {
        // Ensure we have a proper ID for new events
        const eventId = eventToSave.id || Date.now();

        const baseEvent = {
            ...eventToSave,
            id: eventId,
            start: new Date(eventToSave.start),
            end: new Date(eventToSave.end),
            // Ensure these are preserved or defaulted
            type: eventToSave.type || 'task',
            status: eventToSave.status || 'pending',
            priority: eventToSave.priority || 'medium',
            amount: eventToSave.amount || '',
            workoutLog: eventToSave.workoutLog || [],
            // Ensure seriesId is properly set
            seriesId: eventToSave.seriesId || null,
            // Ensure recurrenceEnd is preserved
            recurrenceEnd: eventToSave.recurrenceEnd || null
        };

        let updatedEvents = [...events];
        let currentSeriesId = baseEvent.seriesId;

        // Generate new Series ID if this is a NEW recurring event
        if (!currentSeriesId && baseEvent.recurrence && baseEvent.recurrence !== 'none') {
            currentSeriesId = `series_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            baseEvent.seriesId = currentSeriesId;
        }

        // --- SCOPE HANDLING ---
        const isEditingExisting = eventToSave.id && events.some(e => e.id === eventToSave.id);

        if (scope === 'this') {
            // Detach from series but keep the same ID
            const detachedEvent = {
                ...baseEvent,
                seriesId: null,
                recurrence: 'none'
            };

            if (isEditingExisting) {
                updatedEvents = updatedEvents.map(e =>
                    e.id === baseEvent.id ? detachedEvent : e
                );
            } else {
                updatedEvents.push(detachedEvent);
            }
        }
        else if (scope === 'following') {
            // 1. Find all events with the same seriesId
            const seriesEvents = events.filter(e => e.seriesId === eventToSave.seriesId);

            // 2. Separate past and future events
            const pastEvents = seriesEvents.filter(e => new Date(e.start) < new Date(baseEvent.start));
            const futureEvents = seriesEvents.filter(e => new Date(e.start) >= new Date(baseEvent.start));

            // 3. Remove future events from the old series
            updatedEvents = updatedEvents.filter(e =>
                !(e.seriesId === eventToSave.seriesId && new Date(e.start) >= new Date(baseEvent.start))
            );

            // 4. Create new series ID for the modified event
            const newSeriesId = `series_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            baseEvent.seriesId = newSeriesId;

            // 5. Add the modified event
            updatedEvents.push(baseEvent);
        }
        else if (scope === 'all') {
            // Remove all events with this seriesId
            updatedEvents = updatedEvents.filter(e => e.seriesId !== eventToSave.seriesId);
            // Add the modified event as the new base
            updatedEvents.push(baseEvent);
        }
        else { // 'single' or new event
            if (isEditingExisting) {
                updatedEvents = updatedEvents.map(e =>
                    e.id === baseEvent.id ? baseEvent : e
                );
            } else {
                updatedEvents.push(baseEvent);
            }
        }

        // --- GENERATION PHASE ---
        // Only generate for recurring events that should have instances
        if ((['following', 'all', 'single'].includes(scope)) &&
            baseEvent.recurrence &&
            baseEvent.recurrence !== 'none' &&
            baseEvent.seriesId) {

            const instances = generateRecurringEvents(baseEvent, baseEvent.recurrence);
            updatedEvents.push(...instances);
        }

        dispatchWithHistory(setEvents(updatedEvents), events);
        setShowModal(false);
        setNewEvent({
            title: "", description: "", start: new Date(), end: new Date(),
            allDay: false, recurrence: 'none',
            type: 'task', status: 'pending', priority: 'medium', amount: '',
            workoutLog: [], seriesId: null
        });
    };

    // 4. Execute Delete Logic
    const executeDelete = (eventToDelete, scope) => {
        let updatedEvents = [...events];

        if (scope === 'this') {
            updatedEvents = updatedEvents.filter(e => e.id !== eventToDelete.id);
        } else if (scope === 'following') {
            updatedEvents = updatedEvents.filter(e => {
                if (e.seriesId === eventToDelete.seriesId) {
                    // Delete if start date is >= current start
                    return new Date(e.start) < new Date(eventToDelete.start);
                }
                return true;
            });
        } else if (scope === 'all') {
            updatedEvents = updatedEvents.filter(e => e.seriesId !== eventToDelete.seriesId);
        } else {
            updatedEvents = updatedEvents.filter(e => e.id !== eventToDelete.id);
        }

        dispatchWithHistory(setEvents(updatedEvents), events);
        setShowModal(false);
    };

    // Modal Confirmation Handler
    const confirmRecurrenceAction = (scope) => {
        if (recurrenceAction === 'edit' && pendingEventData) {
            executeSave(pendingEventData, scope);
        } else if (recurrenceAction === 'delete' && pendingEventData) {
            executeDelete(pendingEventData, scope);
        }
        // Reset modal state
        setShowRecurrenceModal(false);
        setRecurrenceAction(null);
        setPendingEventData(null);
    };

    // Replace handleSelectEvent with multi-select version
    const handleSelectEvent = (event, e) => {
        // Check if synthetic event or native event
        const nativeEvent = e?.nativeEvent || e;

        if (nativeEvent && (nativeEvent.shiftKey || nativeEvent.ctrlKey || nativeEvent.metaKey)) {
            // Multi-select mode
            e?.preventDefault?.();
            setSelectedEvents(prev => {
                if (prev.includes(event.id)) {
                    return prev.filter(id => id !== event.id);
                } else {
                    return [...prev, event.id];
                }
            });
        } else {
            // Single select - open edit modal
            setSelectedEvents([event.id]);
            setNewEvent({
                ...event,
                start: new Date(event.start),
                end: new Date(event.end)
            });
            setShowModal(true);
        }
    };

    const [showPresetDropdown, setShowPresetDropdown] = useState(false);

    const loadPreset = (template) => {
        const exercises = template.exercises || [];

        // Convert array of exercise objects into structured log objects
        const workoutLog = exercises.map(ex => {
            const isObject = typeof ex === 'object' && ex !== null;
            const name = isObject ? ex.name : ex;
            const type = isObject ? (ex.type || 'count') : 'count';

            return {
                name: name,
                type: type,
                sets: "",
                reps: "",
                comment: "",
                completed: false, // for tick
                value: "" // for count/text
            };
        });

        setNewEvent(prev => ({
            ...prev,
            title: prev.title || template.name,
            workoutLog: workoutLog
        }));
        setShowPresetDropdown(false);
    };

    // Workout log handlers
    const handleLogChange = (index, field, value) => {
        setNewEvent(prev => ({
            ...prev,
            workoutLog: prev.workoutLog.map((log, i) =>
                i === index ? { ...log, [field]: value } : log
            )
        }));
    };

    const handleAddLogExercise = () => {
        if (newEvent.workoutLog.length >= 20) return;
        setNewEvent(prev => ({
            ...prev,
            workoutLog: [...prev.workoutLog, { name: "", type: "count", sets: "", reps: "", comment: "", completed: false, value: "" }]
        }));
    };

    const handleRemoveLogExercise = (index) => {
        setNewEvent(prev => ({
            ...prev,
            workoutLog: prev.workoutLog.filter((_, i) => i !== index)
        }));
    };

    // Navigation and View Handlers
    const handleNavigate = useCallback((newDate) => setDate(newDate), [setDate]);
    const handleViewChange = useCallback((newView) => setView(newView), [setView]);

    // Exercise Input Handlers (for Template Modal)
    const handleExerciseChange = (index, field, value) => {
        const updatedExercises = [...templateForm.exercises];
        updatedExercises[index][field] = value;
        setTemplateForm({ ...templateForm, exercises: updatedExercises });
    };

    const handleAddExercise = () => {
        setTemplateForm({ ...templateForm, exercises: [...templateForm.exercises, { name: "", type: "count" }] });
    };

    const handleRemoveExercise = (index) => {
        const updatedExercises = templateForm.exercises.filter((_, i) => i !== index);
        setTemplateForm({ ...templateForm, exercises: updatedExercises });
    };

    // Library-native styling for grid lines
    const slotPropGetter = useCallback((date) => ({
        style: {
            borderTop: '1px solid rgba(255, 255, 255, 0.03)',
        },
    }), []);

    const dayPropGetter = useCallback((date) => ({
        style: {
            border: '1px solid rgba(255, 255, 255, 0.03)',
            backgroundColor: 'transparent',
        },
    }), []);

    return (
        <div className="flex h-screen overflow-hidden bg-transparent font-montserrat text-white selection:bg-purple-500/30">
            <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                </div>
            )}

            <div className="flex-1 flex flex-col h-full relative z-10 p-4 md:p-6 lg:p-8 overflow-y-auto custom-scrollbar">

                {/* Header - Consistent with Chat.jsx */}
                <header className="flex-none h-16 w-full flex items-center justify-between px-4 lg:px-6 mb-4 border-b border-white/5 bg-[#0f1115]/80 backdrop-blur-md rounded-2xl">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
                            aria-label="Toggle sidebar"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <h1 className="text-xl font-bold text-white tracking-tight">Calendar</h1>
                    </div>
                </header>

                {/* Calendar Container */}
                <div className="flex-1 bg-[#0f1115]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                    <DnDCalendar
                        localizer={localizer}
                        events={filteredEvents}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}

                        // Drag & Drop precision
                        step={15}
                        timeslots={4}

                        // Controlled props
                        view={view}
                        onView={handleViewChange}
                        date={date}
                        onNavigate={handleNavigate}

                        selectable
                        onSelectSlot={handleSelectSlot}
                        onSelectEvent={handleSelectEvent}
                        onEventDrop={onEventDrop}
                        onEventResize={onEventResize}
                        resizable
                        views={['month', 'week', 'day']}
                        components={{
                            toolbar: (props) => (
                                <CustomToolbar
                                    {...props}
                                    filterType={filterType} setFilterType={setFilterType}
                                    filterStatus={filterStatus} setFilterStatus={setFilterStatus}
                                    searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                                    // Pass additional props
                                    undo={undo} redo={redo}
                                    historyIndex={historyIndex} history={history}
                                    selectedEvents={selectedEvents}
                                    onBulkDelete={handleBulkDelete}
                                    onBulkStatusChange={handleBulkStatusChange}
                                    onClearSelection={() => setSelectedEvents([])}
                                    onJumpToDate={handleNavigate}
                                />
                            )
                        }}

                        // Custom Grid Styling via Props
                        slotPropGetter={slotPropGetter}
                        dayPropGetter={dayPropGetter}

                        eventPropGetter={(event) => {
                            const isSelected = selectedEvents.includes(event.id);
                            const isRecurring = event.recurrence && event.recurrence !== 'none';
                            const isRepeating = event.repeatsYearly || isRecurring;

                            return {
                                style: {
                                    background: isSelected
                                        ? 'linear-gradient(135deg, rgba(245,158,11,0.9) 0%, rgba(217,119,6,0.8) 100%)'
                                        : isRepeating
                                            ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(124, 58, 237, 0.8) 100%)'
                                            : 'linear-gradient(135deg, rgba(6, 182, 212, 0.9) 0%, rgba(59, 130, 246, 0.8) 100%)',
                                    borderRadius: '8px',
                                    border: isSelected ? '2px solid rgba(245,158,11,0.8)' : 'none',
                                    color: 'white',
                                    boxShadow: isSelected
                                        ? '0 4px 12px rgba(245,158,11,0.4)'
                                        : isRepeating
                                            ? '0 4px 12px rgba(139, 92, 246, 0.3)'
                                            : '0 4px 12px rgba(6, 182, 212, 0.3)',
                                    display: 'block',
                                    backdropFilter: 'blur(5px)',
                                    cursor: 'pointer'
                                }
                            };
                        }}
                    />
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-2xl bg-[#1a1d24] border border-white/10 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center mb-6 shrink-0">
                            <h2 className="text-2xl font-bold text-white">
                                {newEvent.id ? 'Edit Event' : 'New Event'}
                            </h2>
                            {/* Preset Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowPresetDropdown(!showPresetDropdown)}
                                    className="text-xs font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                                >
                                    Load Preset <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-transform duration-200 ${showPresetDropdown ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6" /></svg>
                                </button>
                                {showPresetDropdown && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#252830] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                                        {templates.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => loadPreset(t)}
                                                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                                            >
                                                {t.name}
                                            </button>
                                        ))}
                                        {templates.length === 0 && <div className="px-4 py-2 text-xs text-slate-500">No presets found</div>}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                            {/* Control Bar: Type & Status */}
                            <div className="flex flex-col gap-4">
                                {/* Type Selector */}
                                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                                    {[
                                        { id: 'task', label: 'Task', icon: '📝' },
                                        { id: 'project', label: 'Project', icon: '🚀' },
                                        { id: 'expense', label: 'Expense', icon: '💰' },
                                        { id: 'workout', label: 'Workout', icon: '💪' }
                                    ].map(type => (
                                        <button
                                            key={type.id}
                                            onClick={() => setNewEvent({ ...newEvent, type: type.id })}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${newEvent.type === type.id
                                                ? 'bg-white/10 text-white shadow-lg'
                                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                                }`}
                                        >
                                            <span className="text-base">{type.icon}</span>
                                            <span className="hidden md:inline">{type.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Status & Priority Row */}
                                <div className="flex gap-4">
                                    {/* Status */}
                                    <div className="flex-1">
                                        <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-2 font-bold">Status</label>
                                        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                                            {[
                                                { id: 'pending', label: 'Pending', color: 'text-yellow-400' },
                                                { id: 'in_progress', label: 'In Prog', color: 'text-blue-400' },
                                                { id: 'completed', label: 'Done', color: 'text-green-400' },
                                                { id: 'blocked', label: 'Block', color: 'text-red-400' }
                                            ].map(status => (
                                                <button
                                                    key={status.id}
                                                    onClick={() => setNewEvent({ ...newEvent, status: status.id })}
                                                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${newEvent.status === status.id
                                                        ? `bg-white/10 ${status.color} shadow`
                                                        : 'text-slate-600 hover:text-slate-400'
                                                        }`}
                                                >
                                                    {status.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Priority */}
                                    <div className="w-1/3">
                                        <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-2 font-bold">Priority</label>
                                        <select
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-cyan-500/50 appearance-none font-bold uppercase tracking-wide"
                                            value={newEvent.priority}
                                            onChange={(e) => setNewEvent({ ...newEvent, priority: e.target.value })}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Event Title</label>
                                <input
                                    type="text"
                                    autoFocus
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-600"
                                    placeholder={newEvent.type === 'expense' ? "e.g. Server Costs" : "e.g. Gym with Brandon"}
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                />
                            </div>

                            {/* Conditional Amount Input for Expenses */}
                            {newEvent.type === 'expense' && (
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Amount ($)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors font-mono text-lg"
                                        placeholder="0.00"
                                        value={newEvent.amount}
                                        onChange={(e) => setNewEvent({ ...newEvent, amount: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Start</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors calendar-input text-xs"
                                        value={moment(newEvent.start).format('YYYY-MM-DDTHH:mm')}
                                        onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <input
                                        type="datetime-local"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors calendar-input text-xs"
                                        value={moment(newEvent.end).format('YYYY-MM-DDTHH:mm')}
                                        onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
                                    />
                                </div>
                            </div>

                            {/* Recurrence End Date Option */}
                            {newEvent.recurrence && newEvent.recurrence !== 'none' && (
                                <div className="mt-2 animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Repeat Until (Optional)</label>
                                    <input
                                        type="date"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors calendar-input text-xs"
                                        value={newEvent.recurrenceEnd ? moment(newEvent.recurrenceEnd).format('YYYY-MM-DD') : ''}
                                        onChange={(e) => setNewEvent({ ...newEvent, recurrenceEnd: e.target.value ? new Date(e.target.value) : null })}
                                        placeholder="Forever"
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1 ml-1">Leave blank to repeat for up to 5 years</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-slate-500 font-bold ml-1">Options</label>
                                <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5">
                                    <label className="flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer hover:bg-white/5 transition-colors flex-1 justify-center">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 rounded border-white/5 text-cyan-600 focus:ring-cyan-500 bg-transparent"
                                            checked={newEvent.allDay}
                                            onChange={(e) => setNewEvent({ ...newEvent, allDay: e.target.checked })}
                                        />
                                        <span className="text-sm font-medium text-slate-300">All Day</span>
                                    </label>
                                    {/* Recurrence Selector */}
                                    <div className="flex-1">
                                        <select
                                            className="w-full bg-transparent border-none text-sm text-slate-300 focus:ring-0 cursor-pointer text-center font-medium"
                                            value={newEvent.recurrence || 'none'}
                                            onChange={(e) => setNewEvent({ ...newEvent, recurrence: e.target.value })}
                                        >
                                            <option value="none">Does not repeat</option>
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="biweekly">Every 2 Weeks</option>
                                            <option value="monthly">Monthly</option>
                                            <option value="yearly">Yearly</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Workout Log Section - Only for Workouts */}
                            {newEvent.type === 'workout' && (
                                <div className="space-y-3 flex-1 overflow-hidden flex flex-col pt-2 border-t border-white/5 mt-2">
                                    <div className="flex justify-between items-end px-1">
                                        <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Workout Log</label>

                                        <div className="relative">
                                            <button
                                                onClick={() => setShowPresetDropdown(!showPresetDropdown)}
                                                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wide flex items-center gap-1"
                                            >
                                                Load Preset <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7" /></svg>
                                            </button>
                                            {showPresetDropdown && (
                                                <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1d24] border border-white/10 rounded-xl shadow-xl overflow-hidden z-20">
                                                    {templates.map(t => (
                                                        <button
                                                            key={t.id}
                                                            onClick={() => loadPreset(t)}
                                                            className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors border-b border-white/5 last:border-0"
                                                        >
                                                            {t.name}
                                                        </button>
                                                    ))}
                                                    {templates.length === 0 && <div className="px-4 py-3 text-xs text-slate-500 text-center">No presets saved</div>}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-white/5 rounded-2xl p-1 border border-white/5 flex-1 overflow-y-auto custom-scrollbar min-h-[150px]">
                                        {newEvent.workoutLog.map((log, index) => (
                                            <div key={index} className="flex flex-wrap md:flex-nowrap gap-2 p-3 border-b border-white/5 last:border-0 items-center hover:bg-white/5 transition-colors rounded-xl group bg-black/20 mb-1">

                                                {/* Editable Name & Type Switcher */}
                                                <div className="flex-grow flex items-center gap-2 w-full md:w-auto min-w-[150px]">
                                                    <button
                                                        onClick={() => {
                                                            const types = ['count', 'single', 'tick', 'text'];
                                                            const currentIdx = types.indexOf(log.type);
                                                            const nextType = types[(currentIdx + 1) % types.length];
                                                            handleLogChange(index, 'type', nextType);
                                                        }}
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 text-[10px] font-bold text-cyan-400 hover:bg-white/20 transition-colors shrink-0 border border-white/5"
                                                        title="Switch Type"
                                                    >
                                                        {log.type === 'tick' ? '✓' : log.type === 'text' ? 'T' : log.type === 'single' ? '1' : '#'}
                                                    </button>
                                                    <input
                                                        type="text"
                                                        className="bg-black/40 border border-white/10 text-white text-sm font-medium w-full focus:outline-none focus:border-cyan-500/50 rounded-lg px-3 py-1.5 placeholder:text-slate-600 min-w-[100px]"
                                                        value={log.name}
                                                        onChange={(e) => handleLogChange(index, 'name', e.target.value)}
                                                        placeholder="Exercise Name"
                                                    />
                                                </div>

                                                {/* Dynamic Input based on Type */}
                                                <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
                                                    <div className="flex-1 md:flex-none">
                                                        {log.type === 'tick' ? (
                                                            <label className="flex items-center gap-3 cursor-pointer p-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={log.completed || false}
                                                                    onChange={(e) => handleLogChange(index, 'completed', e.target.checked)}
                                                                    className="w-5 h-5 rounded border-white/20 bg-black/40 text-cyan-500 focus:ring-offset-0 focus:ring-0"
                                                                />
                                                                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">{log.completed ? 'Done' : 'Pending'}</span>
                                                            </label>
                                                        ) : log.type === 'single' ? (
                                                            <input
                                                                type="text"
                                                                placeholder="Amount"
                                                                className="w-24 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-center text-xs text-white focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600 font-mono"
                                                                value={log.value || ""}
                                                                onChange={(e) => handleLogChange(index, 'value', e.target.value)}
                                                            />
                                                        ) : log.type === 'text' ? (
                                                            <input
                                                                type="text"
                                                                placeholder="Notes..."
                                                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600"
                                                                value={log.value || ""}
                                                                onChange={(e) => handleLogChange(index, 'value', e.target.value)}
                                                            />
                                                        ) : (
                                                            // Default 'count'
                                                            <div className="flex gap-2 items-center">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Sets"
                                                                    className="w-16 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-center text-xs text-white focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600 font-mono"
                                                                    value={log.sets}
                                                                    onChange={(e) => handleLogChange(index, 'sets', e.target.value)}
                                                                />
                                                                <span className="text-slate-600 text-[10px]">x</span>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Reps"
                                                                    className="w-16 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-center text-xs text-white focus:outline-none focus:border-cyan-500/50 placeholder:text-slate-600 font-mono"
                                                                    value={log.reps}
                                                                    onChange={(e) => handleLogChange(index, 'reps', e.target.value)}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveLogExercise(index)}
                                                        className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors shrink-0"
                                                    >
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={handleAddLogExercise}
                                            className="w-full py-3 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-cyan-400 hover:bg-white/5 transition-colors rounded-xl flex items-center justify-center gap-2 border border-dashed border-white/10 hover:border-cyan-500/30 mt-2"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>
                                            Add Exercise
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>

                        <div className="flex gap-3 mt-6 pt-4 border-t border-white/5 relative z-10">
                            {newEvent.id && (
                                <button
                                    onClick={handleDeleteEvent}
                                    className="px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                >
                                    Delete
                                </button>
                            )}
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors ml-auto"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEvent}
                                className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all transform hover:-translate-y-0.5"
                            >
                                Save Event
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Template Manager Modal */}
            {showTemplateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-2xl bg-[#1a1d24] border border-white/10 rounded-2xl p-6 shadow-2xl relative flex flex-col max-h-[80vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Manage Presets</h2>
                            <button onClick={() => setShowTemplateModal(false)} className="p-2 hover:bg-white/10 rounded-lg"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                        </div>

                        <div className="flex gap-6 flex-1 overflow-hidden">
                            {/* List */}
                            <div className="w-1/3 border-r border-white/10 pr-4 overflow-y-auto custom-scrollbar">
                                <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-3">Saved Presets</h3>
                                <div className="space-y-2">
                                    {templates.map(t => (
                                        <div key={t.id} className="group relative">
                                            <div className="p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/20 transition-colors">
                                                <p className="font-bold text-sm text-white">{t.name}</p>
                                            </div>
                                            <button
                                                onClick={() => deleteTemplate(t.id)}
                                                className="absolute top-1 right-1 p-1.5 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Form */}
                            <div className="flex-1 flex flex-col">
                                <h3 className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-3">New Preset</h3>
                                <div className="space-y-4 flex-1 flex flex-col">
                                    <input
                                        type="text"
                                        placeholder="Preset Name (e.g. Leg Day)"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500/50"
                                        value={templateForm.name}
                                        onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })}
                                    />

                                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                                        <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Exercises</label>
                                        {templateForm.exercises.map((exercise, index) => (
                                            <div key={index} className="flex flex-col gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder={`Exercise ${index + 1} (e.g. Squat)`}
                                                        className="flex-1 bg-black/20 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500/50 text-sm"
                                                        value={exercise.name}
                                                        onChange={e => handleExerciseChange(index, "name", e.target.value)}
                                                    />
                                                    {templateForm.exercises.length > 1 && (
                                                        <button
                                                            onClick={() => handleRemoveExercise(index)}
                                                            className="p-2.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] uppercase font-bold text-slate-500">Track by:</span>
                                                    <div className="flex gap-1">
                                                        {['tick', 'count', 'text'].map(type => (
                                                            <button
                                                                key={type}
                                                                onClick={() => handleExerciseChange(index, "type", type)}
                                                                className={`
                                                                    px-2 py-1 rounded-md text-[9px] uppercase font-bold tracking-wider transition-all
                                                                    ${exercise.type === type
                                                                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                                                        : 'bg-white/5 text-slate-500 hover:text-slate-300 border border-transparent'}
                                                                `}
                                                            >
                                                                {type}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={handleAddExercise}
                                            className="w-full py-2.5 border border-dashed border-white/20 rounded-xl text-slate-400 text-xs font-bold uppercase tracking-wider hover:bg-white/5 hover:text-white transition-colors mt-2"
                                        >
                                            + Add Exercise
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={saveTemplate}
                                    disabled={!templateForm.name}
                                    className="mt-4 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Create Preset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Luxury CSS Overrides */}
            <style>{`
                /* Base Calendar */
                .rbc-calendar { font-family: 'Montserrat', sans-serif; color: #94a3b8; }
                
                /* Main Grid - Remove harsh borders */
                .rbc-month-view, .rbc-time-view, .rbc-agenda-view { 
                    border: none; 
                    background: transparent;
                }
                .rbc-header { 
                    border-bottom: 1px solid rgba(255,255,255,0.03) !important; 
                    padding: 20px 0; 
                    font-weight: 800; 
                    text-transform: uppercase; 
                    letter-spacing: 0.15em;
                    font-size: 0.7rem; 
                    color: #64748b; 
                }
                
                /* Relaxed overrides (let props handle it, or provide soft fallback) */
                .rbc-month-row + .rbc-month-row { border-top-color: rgba(255,255,255,0.03) !important; }
                .rbc-day-bg { border-left-color: rgba(255,255,255,0.03) !important; }
                .rbc-day-bg + .rbc-day-bg { border-left-color: rgba(255,255,255,0.03) !important; }
                
                /* Cells */
                .rbc-date-cell { 
                    padding: 8px; 
                    font-size: 0.85rem; 
                    font-weight: 600; 
                    color: #475569;
                    text-align: center;
                }
                
                /* Off Range (Next/Prev month) */
                .rbc-off-range-bg { background: transparent; opacity: 0.3; }
                .rbc-off-range .rbc-button-link { color: #334155; }

                /* Today Highlight */
                .rbc-today { 
                    background: linear-gradient(180deg, rgba(6,182,212,0.05) 0%, transparent 100%);
                }       
                .rbc-today .rbc-button-link {
                    color: #22d3ee;
                    text-shadow: 0 0 10px rgba(34,211,238,0.5);
                }

                /* Events - managed by prop getter, but base tweaks here */
                .rbc-event { 
                    padding: 2px 5px; 
                }
                .rbc-event-content { font-size: 0.75rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

                /* Time View Tweaks */
                .rbc-time-header-content { border-left: 1px solid rgba(255,255,255,0.03) !important; }
                .rbc-timeslot-group { border-bottom: 1px solid rgba(255,255,255,0.03) !important; }
                .rbc-time-content { border-top: 1px solid rgba(255,255,255,0.03) !important; }
                .rbc-time-view .rbc-row { min-height: 20px; }
                
                /* Vertical Grid Lines for Week View */
                .rbc-header + .rbc-header { border-left: 1px solid rgba(255,255,255,0.03) !important; }
                .rbc-day-slot + .rbc-day-slot { border-left: 1px solid rgba(255,255,255,0.03) !important; }
                
                /* Time Gutter (Left Axis) */
                .rbc-time-gutter { border-right: 1px solid rgba(255,255,255,0.03) !important; }
                
            `}</style>
            {/* Recurrence Choice Modal */}
            {showRecurrenceModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-sm bg-[#1a1d24] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
                        <h3 className="text-lg font-bold text-white mb-4">
                            {recurrenceAction === 'delete' ? 'Delete Recurring Event' : 'Edit Recurring Event'}
                        </h3>
                        <p className="text-sm text-slate-400 mb-6">
                            This event is part of a series. How would you like to apply your changes?
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => confirmRecurrenceAction('this')}
                                className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-left group"
                            >
                                <div className="text-sm font-bold text-white group-hover:text-cyan-400">This event only</div>
                                <div className="text-[10px] text-slate-500">
                                    {recurrenceAction === 'delete' ? 'Delete only this instance' : 'Changes apply to this instance only'}
                                </div>
                            </button>

                            <button
                                onClick={() => confirmRecurrenceAction('following')}
                                className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-left group"
                            >
                                <div className="text-sm font-bold text-white group-hover:text-cyan-400">This and following events</div>
                                <div className="text-[10px] text-slate-500">
                                    {recurrenceAction === 'delete' ? 'Delete this and all future events' : 'Overwrite this and future events'}
                                </div>
                            </button>

                            <button
                                onClick={() => confirmRecurrenceAction('all')}
                                className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-left group"
                            >
                                <div className="text-sm font-bold text-white group-hover:text-cyan-400">All events</div>
                                <div className="text-[10px] text-slate-500">
                                    {recurrenceAction === 'delete' ? 'Delete the entire series' : 'Apply changes to the whole series'}
                                </div>
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                setShowRecurrenceModal(false);
                                setRecurrenceAction(null);
                                setPendingEventData(null);
                            }}
                            className="mt-6 w-full py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper for datetime-local input (YYYY-MM-DDTHH:mm)
const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const pad = n => n < 10 ? '0' + n : n;
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
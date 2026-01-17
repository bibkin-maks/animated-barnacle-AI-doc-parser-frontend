import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import Sidebar from '../components/SideBar';

// Use Moment.js localizer - Rock solid stability for Week/Day views
const localizer = momentLocalizer(moment);

const DnDCalendar = withDragAndDrop(Calendar);

// Custom Toolbar to match app aesthetic
const CustomToolbar = (toolbar) => {
    const goToBack = () => {
        toolbar.onNavigate('PREV');
    };
    const goToNext = () => {
        toolbar.onNavigate('NEXT');
    };
    const goToCurrent = () => {
        toolbar.onNavigate('TODAY');
    };
    const label = () => {
        const date = toolbar.date;
        return (
            <span className="text-xl font-bold text-white uppercase tracking-wider">
                {moment(date).format('MMMM YYYY')}
            </span>
        );
    };

    return (
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl gap-4">
            <div className="flex items-center gap-2">
                <button onClick={goToBack} className="p-2 rounded hover:bg-white/10 text-slate-300 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                </button>
                <button onClick={goToCurrent} className="px-4 py-1.5 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 text-sm font-bold uppercase transition-colors">
                    Today
                </button>
                <button onClick={goToNext} className="p-2 rounded hover:bg-white/10 text-slate-300 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                </button>
            </div>

            <div className="text-center">{label()}</div>

            <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg">
                <button
                    onClick={() => toolbar.onView(Views.MONTH)}
                    className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors ${toolbar.view === Views.MONTH ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Month
                </button>
                <button
                    onClick={() => toolbar.onView(Views.WEEK)}
                    className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors ${toolbar.view === Views.WEEK ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Week
                </button>
                <button
                    onClick={() => toolbar.onView(Views.DAY)}
                    className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors ${toolbar.view === Views.DAY ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    Day
                </button>
            </div>
        </div>
    );
};

export default function CalendarPage() {
    const [events, setEvents] = useState([]);
    const [view, setView] = useState(Views.MONTH);
    const [date, setDate] = useState(new Date());

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [newEvent, setNewEvent] = useState({
        title: "",
        description: "",
        start: new Date(),
        end: new Date(),
        allDay: false,
        repeatsYearly: false,
        workoutLog: [] // Array of { name, sets, reps, comment }
    });

    const [templates, setTemplates] = useState([]);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [templateForm, setTemplateForm] = useState({ name: "", exercises: [""] });

    // Load templates from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem('workout_templates');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Ensure legacy templates with 'content' strings are handled or migrated if necessary
                // For now, we'll just use them as is, but new ones will use 'exercises' array
                setTemplates(parsed);
            } catch (e) { console.error("Failed templates load", e); }
        } else {
            // Default templates if none exist
            const defaults = [
                { id: 't1', name: 'Push Day', exercises: ['Bench Press', 'Overhead Press', 'Incline Dumbbell', 'Tricep Pushdowns'] },
                { id: 't2', name: 'Pull Day', exercises: ['Deadlift', 'Pullups', 'Barbell Rows', 'Face Pulls', 'Bicep Curls'] },
                { id: 't3', name: 'Leg Day', exercises: ['Squat', 'Romanian Deadlift', 'Leg Press', 'Calf Raises'] }
            ];
            setTemplates(defaults);
            localStorage.setItem('workout_templates', JSON.stringify(defaults));
        }
    }, []);

    const saveTemplate = () => {
        if (!templateForm.name) return;
        const exercises = templateForm.exercises.filter(ex => ex.trim() !== "");
        const newTemplate = {
            id: Date.now().toString(),
            name: templateForm.name,
            exercises: exercises
        };
        const updated = [...templates, newTemplate];
        setTemplates(updated);
        localStorage.setItem('workout_templates', JSON.stringify(updated));
        setTemplateForm({ name: "", exercises: [""] });
    };

    const deleteTemplate = (id) => {
        const updated = templates.filter(t => t.id !== id);
        setTemplates(updated);
        localStorage.setItem('workout_templates', JSON.stringify(updated));
    };

    // Helper to persist events
    const persistEvents = (updatedEvents) => {
        localStorage.setItem('calendar_events', JSON.stringify(updatedEvents));
    };

    // Load from LocalStorage
    useEffect(() => {
        const savedEvents = localStorage.getItem('calendar_events');
        if (savedEvents) {
            try {
                const parsed = JSON.parse(savedEvents).map(evt => ({
                    ...evt,
                    start: new Date(evt.start),
                    end: new Date(evt.end),
                    workoutLog: evt.workoutLog || [] // Ensure workoutLog exists
                }));
                const validEvents = parsed.filter(e => !isNaN(e.start) && !isNaN(e.end));
                setEvents(validEvents);
            } catch (e) {
                console.error("Failed to parse calendar events", e);
            }
        }
    }, []);

    const onEventResize = useCallback(
        ({ event, start, end }) => {
            const nextEvents = events.map((existingEvent) => {
                return existingEvent.id === event.id
                    ? { ...existingEvent, start: new Date(start), end: new Date(end) }
                    : existingEvent;
            });

            setEvents(nextEvents);
            persistEvents(nextEvents);
        },
        [events]
    );

    const onEventDrop = useCallback(
        ({ event, start, end, isAllDay: droppedOnAllDaySlot = false }) => {
            const { allDay } = event;
            if (!allDay && droppedOnAllDaySlot) {
                event.allDay = true;
            } else if (allDay && !droppedOnAllDaySlot) {
                event.allDay = false;
            }

            const nextEvents = events.map((existingEvent) => {
                return existingEvent.id === event.id
                    ? { ...existingEvent, start: new Date(start), end: new Date(end), allDay: event.allDay }
                    : existingEvent;
            });

            setEvents(nextEvents);
            persistEvents(nextEvents);
        },
        [events]
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
            repeatsYearly: false,
            workoutLog: []
        });

        setSelectedSlot(slotInfo);
        setShowModal(true);
    };

    const handleSaveEvent = () => {
        if (!newEvent.title) return;

        const eventToSave = {
            id: newEvent.id || Date.now(),
            title: newEvent.title,
            description: newEvent.description,
            start: newEvent.start,
            end: newEvent.end,
            allDay: newEvent.allDay,
            repeatsYearly: newEvent.repeatsYearly,
            workoutLog: newEvent.workoutLog
        };

        let updatedEvents;
        if (newEvent.id) {
            // Edit existing
            updatedEvents = events.map(e => e.id === newEvent.id ? eventToSave : e);
        } else {
            // New
            updatedEvents = [...events, eventToSave];
        }

        // Handle yearly repeats if new
        if (!newEvent.id && eventToSave.repeatsYearly) {
            for (let i = 1; i <= 5; i++) {
                const nextStart = new Date(eventToSave.start);
                nextStart.setFullYear(nextStart.getFullYear() + i);
                const nextEnd = new Date(eventToSave.end);
                nextEnd.setFullYear(nextEnd.getFullYear() + i);

                updatedEvents.push({
                    ...eventToSave,
                    id: `${eventToSave.id}_year_${i}`,
                    start: nextStart,
                    end: nextEnd
                });
            }
        }

        setEvents(updatedEvents);
        persistEvents(updatedEvents);

        setShowModal(false);
        setNewEvent({ title: "", description: "", start: new Date(), end: new Date(), allDay: false, repeatsYearly: false, workoutLog: [] });
    };

    const handleSelectEvent = (event) => {
        setNewEvent({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end)
        });
        setShowModal(true);
    };

    const [showPresetDropdown, setShowPresetDropdown] = useState(false);

    const loadPreset = (template) => {
        const exercises = template.exercises || []; // Support new array format

        // Convert array of exercise names into structured log objects
        const workoutLog = exercises.map(name => ({
            name: name,
            sets: "",
            reps: "",
            comment: ""
        }));

        setNewEvent(prev => ({
            ...prev,
            title: prev.title || template.name,
            workoutLog: workoutLog
        }));
        setShowPresetDropdown(false);
    };

    // Workout log handlers
    const handleLogChange = (index, field, value) => {
        const updatedLog = [...newEvent.workoutLog];
        updatedLog[index][field] = value;
        setNewEvent({ ...newEvent, workoutLog: updatedLog });
    };

    const handleAddLogExercise = () => {
        if (newEvent.workoutLog.length >= 20) return;
        setNewEvent(prev => ({
            ...prev,
            workoutLog: [...prev.workoutLog, { name: "", sets: "", reps: "", comment: "" }]
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

    // Exercise Input Handlers
    const handleExerciseChange = (index, value) => {
        const updatedExercises = [...templateForm.exercises];
        updatedExercises[index] = value;
        setTemplateForm({ ...templateForm, exercises: updatedExercises });
    };

    const handleAddExercise = () => {
        setTemplateForm({ ...templateForm, exercises: [...templateForm.exercises, ""] });
    };

    const handleRemoveExercise = (index) => {
        const updatedExercises = templateForm.exercises.filter((_, i) => i !== index);
        setTemplateForm({ ...templateForm, exercises: updatedExercises });
    };

    return (
        <div className="flex h-screen overflow-hidden bg-transparent font-montserrat text-white selection:bg-purple-500/30">
            <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 flex flex-col h-full relative z-10 p-4 md:p-6 lg:p-8 overflow-y-auto custom-scrollbar">

                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <div className="flex flex-col">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold mb-1">
                            Productivity
                        </p>
                        <h1 className="text-3xl font-bold text-white tracking-tight">
                            Calendar & Events
                        </h1>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowTemplateModal(true)}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-sm font-medium transition-colors hidden sm:block"
                        >
                            Manage Presets
                        </button>
                        {/* Add Event Button for Mobile/Quick Access */}
                        <button
                            onClick={() => {
                                setNewEvent({ ...newEvent, start: new Date(), end: new Date() });
                                setShowModal(true);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold shadow-lg hover:shadow-purple-500/20 transition-all flex items-center gap-2"
                        >
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            <span className="hidden sm:inline">Add Event</span>
                        </button>
                    </div>
                </header>

                {/* Calendar Container */}
                <div className="flex-1 bg-[#0f1115]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                    <DnDCalendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}

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
                            toolbar: CustomToolbar
                        }}
                        eventPropGetter={(event) => ({
                            style: {
                                backgroundColor: event.repeatsYearly ? '#8b5cf6' : '#3b82f6', // Purple for repeating, Blue for normal
                                borderRadius: '6px',
                                border: 'none',
                                opacity: 0.9,
                                display: 'block'
                            }
                        })}
                    />
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-[#1a1d24] border border-white/10 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-6">
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

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Event Title</label>
                                <input
                                    type="text"
                                    autoFocus
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                                    placeholder="e.g. Gym with Brandon"
                                    value={newEvent.title}
                                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Description</label>
                                <textarea
                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors h-24 resize-none"
                                    placeholder="Details about the event..."
                                    value={newEvent.description}
                                    onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Start Time</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none"
                                        value={formatDateForInput(newEvent.start)}
                                        onChange={e => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">End Time</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none"
                                        value={formatDateForInput(newEvent.end)}
                                        onChange={e => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="repeats"
                                    checked={newEvent.repeatsYearly}
                                    onChange={e => setNewEvent({ ...newEvent, repeatsYearly: e.target.checked })}
                                    className="w-5 h-5 rounded border-white/20 bg-black/20 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                                />
                                <label htmlFor="repeats" className="text-sm font-medium text-slate-200 cursor-pointer select-none">
                                    Repeats Yearly (e.g. Birthday)
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEvent}
                                className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg shadow-lg shadow-cyan-500/20 transition-all"
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

                                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                                        <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Exercises</label>
                                        {templateForm.exercises.map((exercise, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder={`Exercise ${index + 1} (e.g. Squat 3x5)`}
                                                    className="flex-1 bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500/50 text-sm"
                                                    value={exercise}
                                                    onChange={e => handleExerciseChange(index, e.target.value)}
                                                />
                                                {templateForm.exercises.length > 1 && (
                                                    <button
                                                        onClick={() => handleRemoveExercise(index)}
                                                        className="p-3 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            onClick={handleAddExercise}
                                            className="w-full py-2 border border-dashed border-white/20 rounded-lg text-slate-400 text-xs font-bold uppercase tracking-wider hover:bg-white/5 hover:text-white transition-colors"
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

            {/* Override styles for react-big-calendar to fit dark theme */}
            <style>{`
                .rbc-calendar { font-family: 'Montserrat', sans-serif; color: #cbd5e1; }
                .rbc-header { border-bottom: 1px solid rgba(255,255,255,0.1); padding: 12px 0; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; color: #94a3b8; }
                .rbc-month-view { border: none; }
                .rbc-day-bg { border-left: 1px solid rgba(255,255,255,0.05); }
                .rbc-off-range-bg { background: rgba(0,0,0,0.2); }
                .rbc-today { background: rgba(6, 182, 212, 0.05); }
                .rbc-event { padding: 4px 8px; font-size: 0.85rem; font-weight: 600; }
                .rbc-toolbar button { color: white; border: 1px solid rgba(255,255,255,0.1); }
                .rbc-toolbar button:active, .rbc-toolbar button.rbc-active { background-color: rgba(255,255,255,0.1); box-shadow: none; }
                .rbc-toolbar button:hover { background-color: rgba(255,255,255,0.1); }
                .rbc-time-view { border: none; }
                .rbc-time-header-content { border-left: 1px solid rgba(255,255,255,0.1); }
                .rbc-timeslot-group { border-bottom: 1px solid rgba(255,255,255,0.05); }
                .rbc-time-content { border-top: 1px solid rgba(255,255,255,0.1); }
                .rbc-day-slot .rbc-time-slot { border-top: 1px solid rgba(255,255,255,0.02); }
                .rbc-current-time-indicator { background-color: #06b6d4; }
                .rbc-show-more { background-color: rgba(255,255,255,0.05); padding: 2px 4px; border-radius: 4px; color: #cbd5e1; }
            `}</style>
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

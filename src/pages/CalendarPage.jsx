import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import { useSelector, useDispatch } from 'react-redux';
import { setEvents, selectEvents } from '../slices/calendarSlice';
import { useGetEventsQuery, useCreateEventMutation, useUpdateEventMutation, useDeleteEventMutation, useDeleteAllEventsMutation } from '../slices/apiSlice';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import Sidebar from '../components/SideBar';
import { useAuth } from '../context/AuthContext';
import { CalendarToolbar } from '../components/calendar/CalendarToolbar';
import { EventModal } from '../components/calendar/EventModal';
import { RecurrenceModal } from '../components/calendar/RecurrenceModal';
import { TemplateModal } from '../components/calendar/TemplateModal';
import { generateRecurringEvents } from '../utils/calendar';

// Use Moment.js localizer - Rock solid stability for Week/Day views
const localizer = momentLocalizer(moment);

// FIX: Date Handling Inconsistency
const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const pad = n => n < 10 ? '0' + n : n;
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const DnDCalendar = withDragAndDrop(Calendar);

// CustomToolbar moved to src/components/calendar/CalendarToolbar.tsx


const CalendarPage = () => {
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

    // FIX: Race Condition Tracking
    const [pendingRequests, setPendingRequests] = useState(new Set());
    const isSaving = pendingRequests.size > 0;

    // Loading State
    // const [isLoading, setIsLoading] = useState(false); // Replaced by API loading state


    // Dispatch with History Wrapper - FIX: Added missing dependencies and metadata
    const dispatchWithHistory = useCallback((action, eventsBefore) => {
        // Deep clone events to avoid reference issues
        const beforeSnapshot = JSON.parse(JSON.stringify(eventsBefore));
        const afterSnapshot = action.payload ? JSON.parse(JSON.stringify(action.payload)) : [];

        const historyItem = {
            action: action.type,
            timestamp: new Date().toISOString(),
            before: beforeSnapshot,
            after: afterSnapshot,
            eventCount: beforeSnapshot.length // Debug metadata
        };

        setHistory(prev => {
            const newHistory = [...prev.slice(0, historyIndex + 1), historyItem];
            return newHistory.slice(-50); // Keep last 50 actions
        });

        setHistoryIndex(prev => Math.min(prev + 1, 49));
        dispatch(action);
    }, [dispatch, historyIndex, events]); // FIX: Added events dependency

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
    // Bulk Operations - FIX: Ensure proper clearing of selection
    const handleBulkDelete = useCallback(() => {
        if (selectedEvents.length === 0) return;

        // Get IDs to be deleted
        const deletedIds = [...selectedEvents];

        const updatedEvents = events.filter(e => !deletedIds.includes(e.id));
        dispatchWithHistory(setEvents(updatedEvents), events);

        // Clear selection AFTER dispatch
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
            // FIX: Start keyboard handling with input check
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

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
    // Derived State: Filtered Events
    // FIX: Removed date/view dependency to prevent memory leak and excessive recalcs
    // Derived State: Filtered Events
    // FIX: Lazy Loading Logic - Generates recurring instances based on current view window
    const filteredEvents = useMemo(() => {
        // Early return if no events
        if (!events || events.length === 0) return [];

        // 1. Calculate View Window
        const mDate = moment(date);
        let viewStart, viewEnd;

        if (view === 'month') {
            viewStart = mDate.clone().startOf('month').subtract(7, 'days').toDate();
            viewEnd = mDate.clone().endOf('month').add(7, 'days').toDate();
        } else if (view === 'week') {
            viewStart = mDate.clone().startOf('week').toDate();
            viewEnd = mDate.clone().endOf('week').toDate();
        } else if (view === 'day') {
            viewStart = mDate.clone().startOf('day').toDate();
            viewEnd = mDate.clone().endOf('day').toDate();
        } else {
            // Fallback
            viewStart = mDate.clone().startOf('month').toDate();
            viewEnd = mDate.clone().endOf('month').toDate();
        }

        const searchLower = searchQuery.toLowerCase();
        const expandedEvents = [];

        // 2. Expand Events
        events.forEach(event => {
            // A. Base Recurring Event -> Generate Instances
            if (event.recurrence && event.recurrence !== 'none' && !event.isInstance) {
                // Add the base event itself if it falls in range (optional, usually base event is the first instance)
                // But simplified generator assumes base event is the pattern source.

                // Generate instances for this view
                const instances = generateRecurringEvents(event, viewStart, viewEnd);
                expandedEvents.push(...instances);

                // Also add the base event if it's within range and "start" is the first occurrence
                if (new Date(event.start) >= viewStart && new Date(event.end) <= viewEnd) {
                    expandedEvents.push(event);
                }
            }
            // B. Single Event or Exception -> Add directly
            else {
                expandedEvents.push(event);
            }
        });

        // 3. Apply Filters
        return expandedEvents.filter(event => {
            const matchesType = filterType === 'all' || event.type === filterType;
            if (!matchesType) return false;

            const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
            if (!matchesStatus) return false;

            if (searchQuery) {
                const titleMatch = event.title?.toLowerCase().includes(searchLower);
                const descMatch = event.description?.toLowerCase().includes(searchLower);
                if (!titleMatch && !descMatch) return false;
            }

            return true;
        });
    }, [events, filterType, filterStatus, searchQuery, date, view]); // Re-run when view/date changes

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

    // API Hooks
    const { data: apiEvents, isLoading: isEventsLoading } = useGetEventsQuery(undefined, { skip: !user });

    const [createEventApi] = useCreateEventMutation();
    const [updateEventApi] = useUpdateEventMutation();
    const [deleteEventApi] = useDeleteEventMutation();
    const [deleteAllEventsApi] = useDeleteAllEventsMutation();


    // Sync API events to Redux Store
    useEffect(() => {
        if (apiEvents) {
            // Convert strings back to Dates because API sends ISO strings
            const parsedEvents = apiEvents.map(evt => ({
                ...evt,
                start: new Date(evt.start),
                end: new Date(evt.end),
                recurrenceEnd: evt.recurrenceEnd ? new Date(evt.recurrenceEnd) : null,
            }));
            dispatch(setEvents(parsedEvents));
        }
    }, [apiEvents, dispatch]);

    // Persist events to localStorage when they change (only as backup/ui state, api is truth)
    // Persist events to localStorage when they change
    // FIX: Throttling LocalStorage writes
    useEffect(() => {
        if (!userStorageKey || events.length === 0) return;

        const timeoutId = setTimeout(() => {
            try {
                localStorage.setItem(userStorageKey, JSON.stringify(events));
            } catch (e) {
                console.error('Failed to save to localStorage:', e);
            }
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [events, userStorageKey]);


    const onEventResize = useCallback(
        ({ event, start, end }) => {
            const nextEvents = events.map((existingEvent) => {
                return existingEvent.id === event.id
                    ? { ...existingEvent, start: new Date(start), end: new Date(end) }
                    : existingEvent;
            });

            dispatchWithHistory(setEvents(nextEvents), events);
        },
        [events, dispatchWithHistory, updateEventApi]
    );

    const onEventDrop = useCallback(
        async ({ event, start, end, isAllDay: droppedOnAllDaySlot = false }) => {
            const { allDay } = event;

            // Create updated event
            const updatedEvent = {
                ...event,
                start: new Date(start),
                end: new Date(end),
                allDay: (!allDay && droppedOnAllDaySlot) ? true :
                    (allDay && !droppedOnAllDaySlot) ? false : allDay
            };

            // Optimistic update
            const nextEvents = events.map((existingEvent) => {
                return existingEvent.id === updatedEvent.id ? updatedEvent : existingEvent;
            });
            dispatchWithHistory(setEvents(nextEvents), events);

            // API Update
            try {
                await updateEventApi(updatedEvent).unwrap();
            } catch (err) {
                console.error("Failed to update dropped event", err);
            }
        },
        [events, dispatchWithHistory, updateEventApi]
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
            workoutLog: [],
            // FIX: Explicitly reset all fields to prevent leaks
            id: undefined,
            recurrenceEnd: null
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

    // Handler for clearing all events
    const handleClearAllEvents = async () => {
        if (window.confirm("ARE YOU SURE? This will permanently delete ALL events from your calendar. This cannot be undone.")) {
            if (window.confirm("Really? All events will be lost forever.")) {
                try {
                    await deleteAllEventsApi().unwrap();
                    // Optional: Clear local selection/history if needed
                    setSelectedEvents([]);
                    setHistory([]);
                    setHistoryIndex(-1);
                } catch (err) {
                    console.error("Failed to clear all events:", err);
                    alert("Failed to clear events. Check console/network.");
                }
            }
        }
    };

    // 3. Execute Save Logic
    const executeSave = async (eventToSave, scope) => {
        const requestId = Date.now().toString();
        setPendingRequests(prev => new Set([...prev, requestId]));

        // FIX: Generate robust ID for new events to prevent collisions
        const eventId = eventToSave.id || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // FIX: Ensure new recurring events have a seriesId
        let finalSeriesId = eventToSave.seriesId;
        if (!finalSeriesId && eventToSave.recurrence && eventToSave.recurrence !== 'none') {
            finalSeriesId = `series_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        const baseEvent = {
            ...eventToSave,
            id: eventId,
            start: new Date(eventToSave.start),
            end: new Date(eventToSave.end),
            type: eventToSave.type || 'task',
            status: eventToSave.status || 'pending',
            priority: eventToSave.priority || 'medium',
            amount: eventToSave.amount || '',
            workoutLog: eventToSave.workoutLog || [],
            seriesId: finalSeriesId || null,
            recurrence: eventToSave.recurrence || 'none',
            recurrenceEnd: eventToSave.recurrenceEnd || null
        };

        const isEditingExisting = eventToSave.id && events.some(e => e.id === eventToSave.id);

        try {
            const apiPromises = [];

            if (scope === 'this') {
                const detachedEvent = {
                    ...baseEvent,
                    seriesId: null,
                    recurrence: 'none'
                };
                if (isEditingExisting) apiPromises.push(updateEventApi(detachedEvent).unwrap());
                else apiPromises.push(createEventApi(detachedEvent).unwrap());
            }
            else if (scope === 'following') {
                const futureEvents = events.filter(e =>
                    e.seriesId === eventToSave.seriesId && new Date(e.start) >= new Date(baseEvent.start) && e.id !== baseEvent.id
                );
                futureEvents.forEach(e => apiPromises.push(deleteEventApi(e.id).unwrap()));

                const newSeriesId = `series_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                baseEvent.seriesId = newSeriesId;

                if (isEditingExisting) apiPromises.push(updateEventApi(baseEvent).unwrap());
                else apiPromises.push(createEventApi(baseEvent).unwrap());
            }
            else if (scope === 'all') {
                const seriesEvents = events.filter(e => e.seriesId === eventToSave.seriesId && e.id !== baseEvent.id);
                seriesEvents.forEach(e => apiPromises.push(deleteEventApi(e.id).unwrap()));

                if (isEditingExisting) apiPromises.push(updateEventApi(baseEvent).unwrap());
                else apiPromises.push(createEventApi(baseEvent).unwrap());
            }
            else { // 'single' or new event
                if (isEditingExisting) apiPromises.push(updateEventApi(baseEvent).unwrap());
                else apiPromises.push(createEventApi(baseEvent).unwrap());
            }

            // --- LAZY GENERATION PHASE ---
            // Only save the base event. Instances are generated on-the-fly in the UI.


            await Promise.all(apiPromises);

            setShowModal(false);
            setNewEvent({
                title: "", description: "", start: new Date(), end: new Date(),
                allDay: false, recurrence: 'none',
                type: 'task', status: 'pending', priority: 'medium', amount: '',
                workoutLog: [], seriesId: null, recurrenceEnd: null, id: undefined
            });

        } catch (err) {
            console.error("Failed to save event", err);
        } finally {
            setPendingRequests(prev => {
                const next = new Set(prev);
                next.delete(requestId);
                return next;
            });
        }
    };
    // 4. Execute Delete Logic
    const executeDelete = async (eventToDelete, scope) => {
        // FIX: Clear selection if this event is selected
        if (selectedEvents.includes(eventToDelete.id)) {
            setSelectedEvents(prev => prev.filter(id => id !== eventToDelete.id));
        }

        const apiPromises = [];

        if (scope === 'this') {
            apiPromises.push(deleteEventApi(eventToDelete.id).unwrap());
        } else if (scope === 'following') {
            const futureEvents = events.filter(e =>
                e.seriesId === eventToDelete.seriesId && new Date(e.start) >= new Date(eventToDelete.start)
            );
            futureEvents.forEach(e => apiPromises.push(deleteEventApi(e.id).unwrap()));
        } else if (scope === 'all') {
            const seriesEvents = events.filter(e => e.seriesId === eventToDelete.seriesId);
            seriesEvents.forEach(e => apiPromises.push(deleteEventApi(e.id).unwrap()));
        } else {
            apiPromises.push(deleteEventApi(eventToDelete.id).unwrap());
        }

        try {
            await Promise.all(apiPromises);
            setShowModal(false);
        } catch (err) {
            console.error("Failed to delete", err);
        }
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
                id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: name,
                type: type,
                sets: "",
                reps: "",
                comment: "",
                completed: false,
                value: "",
                weight: "", // FIX: Added missing fields
                unit: "kg"
            };
        });

        setNewEvent(prev => ({
            ...prev,
            title: prev.title || template.name,
            workoutLog: workoutLog,
            type: 'workout' // FIX: Ensure type is set
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
            {isEventsLoading && (
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
                                <CalendarToolbar
                                    {...props}
                                    date={date}
                                    view={view}
                                    filterType={filterType}
                                    setFilterType={setFilterType}
                                    filterStatus={filterStatus}
                                    setFilterStatus={setFilterStatus}
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    undo={undo}
                                    redo={redo}
                                    historyIndex={historyIndex}
                                    history={history}
                                    selectedEvents={selectedEvents}
                                    onBulkDelete={handleBulkDelete}
                                    onBulkStatusChange={handleBulkStatusChange}
                                    onClearSelection={() => setSelectedEvents([])}
                                    onJumpToDate={(d) => {
                                        setDate(d);
                                        props.onNavigate('DATE', d);
                                    }}
                                    onClearAllEvents={() => {
                                        if (window.confirm("ARE YOU SURE? This will delete ALL events for this user forever. Use with caution.")) {
                                            deleteAllEventsApi().then(() => {
                                                alert("All events deleted.");
                                                window.location.reload();
                                            });
                                        }
                                    }}
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

            {/* Luxury Glass Modal */}
            <EventModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                event={newEvent}
                onEventChange={setNewEvent}
                onSave={handleSaveEvent}
                onDelete={handleDeleteEvent}
                templates={templates}
                showPresetDropdown={showPresetDropdown}
                setShowPresetDropdown={setShowPresetDropdown}
                loadPreset={loadPreset}
                handleAddLogExercise={handleAddLogExercise}
                handleRemoveLogExercise={handleRemoveLogExercise}
                handleLogChange={handleLogChange}
            />

            {/* Template Manager Modal */}
            <TemplateModal
                isOpen={showTemplateModal}
                onClose={() => setShowTemplateModal(false)}
                templates={templates}
                onDeleteTemplate={deleteTemplate}
                templateForm={templateForm}
                setTemplateForm={setTemplateForm}
                onSaveTemplate={saveTemplate}
                onAddExercise={handleAddExercise}
                onRemoveExercise={handleRemoveExercise}
                onExerciseChange={handleExerciseChange}
            />

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
            <RecurrenceModal
                isOpen={showRecurrenceModal}
                onClose={() => {
                    setShowRecurrenceModal(false);
                    setRecurrenceAction(null);
                    setPendingEventData(null);
                }}
                recurrenceAction={recurrenceAction}
                onConfirm={confirmRecurrenceAction}
            />
        </div>
    );
}

export default React.memo(CalendarPage);


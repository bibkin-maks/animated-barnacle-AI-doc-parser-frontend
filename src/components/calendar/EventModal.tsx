import React, { useRef } from 'react';
import moment from 'moment';
import { Event, WorkoutLogItem, Template } from '../../types';

// Helper for date inputs
const formatDateForInput = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => n < 10 ? '0' + n : n;
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};


interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: Event;
    onEventChange: (updatedEvent: Event) => void;
    onSave: () => void;
    onDelete?: () => void;

    // Preset/Template Props
    templates: Template[];
    showPresetDropdown: boolean;
    setShowPresetDropdown: (show: boolean) => void;
    loadPreset: (template: Template) => void;

    // Workout Logic
    handleAddLogExercise: () => void;
    handleRemoveLogExercise: (index: number) => void;
    handleLogChange: (index: number, field: keyof WorkoutLogItem, value: any) => void;
}

export const EventModal: React.FC<EventModalProps> = ({
    isOpen, onClose, event, onEventChange, onSave, onDelete,
    templates, showPresetDropdown, setShowPresetDropdown, loadPreset,
    handleAddLogExercise, handleRemoveLogExercise, handleLogChange
}) => {
    // If not open, don't render (or control via parent)
    if (!isOpen) return null;

    // Refs for optimization if needed, but controlled inputs are fine for this scale
    const titleInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090b]/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-[#0f1115]/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.6)] relative max-h-[85vh] flex flex-col overflow-hidden ring-1 ring-white/5">

                {/* Decorative Glow */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/5 relative z-10 bg-black/20">
                    <div>
                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
                            {event.id ? 'Edit Event' : 'New Event'}
                        </h2>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">
                            {moment(event.start).format('dddd, MMMM Do')}
                        </p>
                    </div>

                    {/* Preset Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowPresetDropdown(!showPresetDropdown)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300"
                        >
                            <span>Load Preset</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-transform duration-300 ${showPresetDropdown ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6" /></svg>
                        </button>
                        {showPresetDropdown && (
                            <div className="absolute right-0 top-full mt-3 w-56 bg-[#1a1d24] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-white/5">Select Template</div>
                                {templates.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => loadPreset(t)}
                                        className="w-full text-left px-4 py-3 text-sm font-medium text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors border-b border-white/5 last:border-0 block"
                                    >
                                        {t.name}
                                    </button>
                                ))}
                                {templates.length === 0 && <div className="px-4 py-4 text-xs text-slate-500 italic text-center">No presets saved</div>}
                            </div>
                        )}
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 relative z-10">

                    {/* 1. Event Title & Main Input */}
                    <div className="group">
                        <label className="block text-[10px] uppercase tracking-widest text-cyan-500/80 font-bold mb-2 ml-1">What are we doing?</label>
                        <input
                            ref={titleInputRef}
                            type="text"
                            autoFocus
                            className="w-full bg-transparent border-b-2 border-white/10 px-2 py-4 text-2xl font-bold text-white placeholder:text-white/10 focus:outline-none focus:border-cyan-500 transition-all duration-300"
                            placeholder={event.type === 'expense' ? "e.g. Server Subscription" : "e.g. Leg Day with Jim"}
                            value={event.title}
                            onChange={(e) => onEventChange({ ...event, title: e.target.value })}
                        />
                    </div>

                    {/* 2. Type Selector (Cards) */}
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 ml-1">Event Type</label>
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { id: 'task', label: 'Task', icon: '📝', color: 'from-purple-500/20 to-blue-500/20', glow: 'group-hover:shadow-purple-500/20' },
                                { id: 'project', label: 'Project', icon: '🚀', color: 'from-pink-500/20 to-rose-500/20', glow: 'group-hover:shadow-pink-500/20' },
                                { id: 'expense', label: 'Expense', icon: '💰', color: 'from-amber-500/20 to-orange-500/20', glow: 'group-hover:shadow-amber-500/20' },
                                { id: 'workout', label: 'Workout', icon: '💪', color: 'from-emerald-500/20 to-cyan-500/20', glow: 'group-hover:shadow-emerald-500/20' }
                            ].map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => onEventChange({ ...event, type: type.id as any })}
                                    className={`
                                        relative group overflow-hidden rounded-2xl p-3 border transition-all duration-300 flex flex-col items-center justify-center gap-2
                                        ${event.type === type.id
                                            ? 'border-cyan-500/50 bg-gradient-to-br from-white/10 to-transparent shadow-[0_0_15px_rgba(6,182,212,0.15)] transform scale-[1.02]'
                                            : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20'
                                        }
                                    `}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 ${event.type === type.id ? 'opacity-100' : 'group-hover:opacity-100'} transition-opacity duration-300`} />
                                    <span className="text-2xl relative z-10 drop-shadow-md transform group-hover:scale-110 transition-transform duration-300">{type.icon}</span>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider relative z-10 ${event.type === type.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3. Details Grid: Status, Priority, Amount */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {/* Status */}
                        <div className="space-y-2">
                            <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Status</label>
                            <div className="relative">
                                <select
                                    className="w-full appearance-none bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer uppercase tracking-wide"
                                    value={event.status}
                                    onChange={(e) => onEventChange({ ...event, status: e.target.value as any })}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="blocked">Blocked</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Priority */}
                        <div className="space-y-2">
                            <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Priority</label>
                            <div className="relative">
                                <select
                                    className="w-full appearance-none bg-white/5 border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer uppercase tracking-wide"
                                    value={event.priority}
                                    onChange={(e) => onEventChange({ ...event, priority: e.target.value as any })}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Condtional Amount */}
                        {event.type === 'expense' && (
                            <div className="space-y-2 animate-in fade-in zoom-in-95">
                                <label className="block text-[10px] uppercase tracking-widest text-yellow-500/80 font-bold ml-1">Amount ($)</label>
                                <input
                                    type="number"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50 font-mono text-sm tracking-wider"
                                    placeholder="0.00"
                                    // @ts-ignore
                                    value={event.amount}
                                    // @ts-ignore
                                    onChange={(e) => onEventChange({ ...event, amount: e.target.value })}
                                />
                            </div>
                        )}
                    </div>

                    {/* 4. Time Setup */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <svg className="text-cyan-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Time & Duration</span>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ${event.allDay ? 'bg-cyan-500' : 'bg-white/10'}`}>
                                    <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300 ${event.allDay ? 'translate-x-4' : ''}`} />
                                </div>
                                <input type="checkbox" className="hidden" checked={event.allDay} onChange={(e) => onEventChange({ ...event, allDay: e.target.checked })} />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-white transition-colors">All Day</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] text-slate-600 font-bold mb-1 ml-1 uppercase">Start</label>
                                <input
                                    type="datetime-local"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-cyan-500/50 focus:outline-none transition-colors calendar-input font-bold tracking-wide"
                                    value={formatDateForInput(event.start)}
                                    onChange={(e) => onEventChange({ ...event, start: new Date(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-600 font-bold mb-1 ml-1 uppercase">End</label>
                                <input
                                    type="datetime-local"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-cyan-500/50 focus:outline-none transition-colors calendar-input font-bold tracking-wide"
                                    value={formatDateForInput(event.end)}
                                    onChange={(e) => onEventChange({ ...event, end: new Date(e.target.value) })}
                                />
                            </div>
                        </div>

                        {/* Recurrence */}
                        <div className="pt-2 border-t border-white/5 flex gap-4">
                            <div className="flex-1">
                                <label className="block text-[10px] text-slate-600 font-bold mb-1 ml-1 uppercase">Repeat</label>
                                <select
                                    className="w-full bg-transparent border border-transparent hover:border-white/10 rounded-lg py-1 px-2 text-xs text-slate-300 focus:bg-black/40 focus:outline-none font-medium"
                                    value={event.recurrence || 'none'}
                                    onChange={(e) => onEventChange({ ...event, recurrence: e.target.value as any })}
                                >
                                    <option value="none">Did not repeat</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="biweekly">Bi-Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                            {event.recurrence && event.recurrence !== 'none' && (
                                <div className="flex-1 animate-in fade-in slide-in-from-left-2">
                                    <label className="block text-[10px] text-slate-600 font-bold mb-1 ml-1 uppercase">Until</label>
                                    <input
                                        type="date"
                                        className="w-full bg-transparent border border-transparent hover:border-white/10 rounded-lg py-1 px-2 text-xs text-slate-300 focus:bg-black/40 focus:outline-none font-medium calendar-input"
                                        value={event.recurrenceEnd ? moment(event.recurrenceEnd).format('YYYY-MM-DD') : ''}
                                        onChange={(e) => onEventChange({ ...event, recurrenceEnd: e.target.value ? new Date(e.target.value) : null })}
                                        placeholder="Forever"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 5. Workout Log (Special Section) */}
                    {event.type === 'workout' && (
                        <div className="space-y-4 pt-4 border-t border-white/5 animate-in fade-in zoom-in-95">
                            <div className="flex items-center justify-between">
                                <label className="text-xs uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></span>
                                    Workout Log
                                </label>
                                <span className="text-[10px] text-slate-500 font-mono">{event.workoutLog?.length || 0} Exercises</span>
                            </div>

                            <div className="bg-black/30 border border-white/10 rounded-2xl overflow-hidden min-h-[150px]">
                                {(!event.workoutLog || event.workoutLog.length === 0) ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-slate-600 gap-2">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                        <span className="text-xs">No exercises added</span>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/5">
                                        {event.workoutLog.map((log, index) => (
                                            <div key={index} className="p-3 hover:bg-white/5 transition-colors group flex items-start gap-3">
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            className="bg-transparent text-sm font-bold text-white placeholder:text-slate-600 focus:outline-none w-full"
                                                            placeholder="Exercise Name"
                                                            value={log.name}
                                                            onChange={(e) => handleLogChange(index, 'name', e.target.value)}
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                const types = ['count', 'single', 'tick', 'text'];
                                                                const currentIdx = types.indexOf(log.type);
                                                                const nextType = types[(currentIdx + 1) % types.length];
                                                                handleLogChange(index, 'type', nextType);
                                                            }}
                                                            className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] font-bold text-slate-400 hover:text-cyan-400 hover:bg-white/10 transition-colors uppercase tracking-wider"
                                                        >
                                                            {log.type}
                                                        </button>
                                                    </div>

                                                    {/* Dynamic Inputs Styled */}
                                                    <div>
                                                        {log.type === 'tick' ? (
                                                            <label className="inline-flex items-center gap-2 cursor-pointer group/check">
                                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${log.completed ? 'bg-cyan-500 border-cyan-500' : 'border-slate-600 bg-transparent'}`}>
                                                                    {log.completed && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="text-black"><path d="M20 6L9 17l-5-5" /></svg>}
                                                                </div>
                                                                <input type="checkbox" className="hidden" checked={log.completed || false} onChange={(e) => handleLogChange(index, 'completed', e.target.checked)} />
                                                                <span className={`text-xs font-bold uppercase tracking-wider ${log.completed ? 'text-cyan-500' : 'text-slate-500 group-hover/check:text-slate-400'}`}>{log.completed ? 'Completed' : 'Pending'}</span>
                                                            </label>
                                                        ) : log.type === 'text' ? (
                                                            <input className="w-full bg-white/5 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:bg-white/10 transition-colors" placeholder="Add notes..." value={log.value || ""} onChange={(e) => handleLogChange(index, 'value', e.target.value)} />
                                                        ) : log.type === 'single' ? (
                                                            <input className="w-20 bg-white/5 rounded px-2 py-1 text-xs text-center font-mono text-white focus:outline-none focus:bg-white/10 transition-colors" placeholder="Value" value={log.value || ""} onChange={(e) => handleLogChange(index, 'value', e.target.value)} />
                                                        ) : (
                                                            <div className="flex gap-2 items-center">
                                                                <div className="flex items-center gap-1 bg-white/5 rounded px-2 py-1 border border-white/5">
                                                                    <input className="w-8 bg-transparent text-center text-xs font-mono text-white focus:outline-none" placeholder="0" value={log.sets} onChange={(e) => handleLogChange(index, 'sets', e.target.value)} />
                                                                    <span className="text-[10px] text-slate-500 font-bold">SETS</span>
                                                                </div>
                                                                <span className="text-slate-600">×</span>
                                                                <div className="flex items-center gap-1 bg-white/5 rounded px-2 py-1 border border-white/5">
                                                                    <input className="w-8 bg-transparent text-center text-xs font-mono text-white focus:outline-none" placeholder="0" value={log.reps} onChange={(e) => handleLogChange(index, 'reps', e.target.value)} />
                                                                    <span className="text-[10px] text-slate-500 font-bold">REPS</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveLogExercise(index)}
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 transition-opacity"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button
                                    onClick={handleAddLogExercise}
                                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors border-t border-white/5 flex items-center justify-center gap-2"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>
                                    Add Exercise
                                </button>
                            </div>
                        </div>
                    )}

                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-white/5 bg-black/40 backdrop-blur-xl flex justify-between items-center gap-3 relative z-20">
                    {event.id && (
                        <button
                            onClick={onDelete}
                            className="px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                            Delete
                        </button>
                    )}
                    <div className="flex gap-3 ml-auto">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSave}
                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold uppercase tracking-widest shadow-[0_4px_20px_rgba(6,182,212,0.3)] hover:shadow-[0_4px_30px_rgba(6,182,212,0.5)] transition-all transform hover:-translate-y-0.5 active:scale-95"
                        >
                            Save Event
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

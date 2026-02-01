import React from 'react';
import { Views } from 'react-big-calendar';
import moment from 'moment';

interface CalendarToolbarProps {
    onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
    date: Date;
    view: string;
    onView: (view: any) => void;
    filterType: string;
    setFilterType: (type: string) => void;
    filterStatus: string;
    setFilterStatus: (status: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    undo: () => void;
    redo: () => void;
    historyIndex: number;
    history: any[];
    selectedEvents: string[]; // IDs
    onBulkDelete: () => void;
    onBulkStatusChange: (status: string) => void;
    onClearSelection: () => void;
    onJumpToDate?: (date: Date) => void;
    onClearAllEvents?: () => void;
}

export const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
    onNavigate,
    date,
    view,
    onView,
    filterType, setFilterType,
    filterStatus, setFilterStatus,
    searchQuery, setSearchQuery,
    undo, redo, historyIndex, history,
    selectedEvents, onBulkDelete, onBulkStatusChange, onClearSelection,
    onJumpToDate, onClearAllEvents
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

                        {/* Clear All Button */}
                        <button
                            onClick={onClearAllEvents}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all ml-2"
                            title="Clear All Events (Delete Everything)"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                <line x1="12" y1="9" x2="12" y2="15"></line>
                                <line x1="9" y1="12" x2="15" y2="12"></line>
                            </svg>
                        </button>
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

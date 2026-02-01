import React from 'react';

interface RecurrenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    recurrenceAction: 'update' | 'delete' | null;
    onConfirm: (action: 'this' | 'following' | 'all') => void;
}

export const RecurrenceModal: React.FC<RecurrenceModalProps> = ({
    isOpen,
    onClose,
    recurrenceAction,
    onConfirm
}) => {
    if (!isOpen) return null;

    return (
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
                        onClick={() => onConfirm('this')}
                        className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-left group"
                    >
                        <div className="text-sm font-bold text-white group-hover:text-cyan-400">This event only</div>
                        <div className="text-[10px] text-slate-500">
                            {recurrenceAction === 'delete' ? 'Delete only this instance' : 'Changes apply to this instance only'}
                        </div>
                    </button>

                    <button
                        onClick={() => onConfirm('following')}
                        className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-left group"
                    >
                        <div className="text-sm font-bold text-white group-hover:text-cyan-400">This and following events</div>
                        <div className="text-[10px] text-slate-500">
                            {recurrenceAction === 'delete' ? 'Delete this and all future events' : 'Overwrite this and future events'}
                        </div>
                    </button>

                    <button
                        onClick={() => onConfirm('all')}
                        className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-left group"
                    >
                        <div className="text-sm font-bold text-white group-hover:text-cyan-400">All events</div>
                        <div className="text-[10px] text-slate-500">
                            {recurrenceAction === 'delete' ? 'Delete the entire series' : 'Apply changes to the whole series'}
                        </div>
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="mt-6 w-full py-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-white transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

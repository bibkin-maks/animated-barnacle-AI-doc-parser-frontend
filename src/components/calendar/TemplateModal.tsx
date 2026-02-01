import React from 'react';
import { Template, WorkoutLogItem } from '../../types';

interface TemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    templates: Template[];
    onDeleteTemplate: (id: string) => void;

    // Form State
    templateForm: { name: string; exercises: WorkoutLogItem[] };
    setTemplateForm: (form: { name: string; exercises: WorkoutLogItem[] }) => void;
    onSaveTemplate: () => void;

    // Exercise Logic
    onAddExercise: () => void;
    onRemoveExercise: (index: number) => void;
    onExerciseChange: (index: number, field: keyof WorkoutLogItem, value: any) => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
    isOpen,
    onClose,
    templates,
    onDeleteTemplate,
    templateForm,
    setTemplateForm,
    onSaveTemplate,
    onAddExercise,
    onRemoveExercise,
    onExerciseChange
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-[#1a1d24] border border-white/10 rounded-2xl p-6 shadow-2xl relative flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Manage Presets</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
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
                                        onClick={() => onDeleteTemplate(t.id)}
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
                        <div className="space-y-4 flex-1 flex-col flex">
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
                                                onChange={e => onExerciseChange(index, "name", e.target.value)}
                                            />
                                            {templateForm.exercises.length > 1 && (
                                                <button
                                                    onClick={() => onRemoveExercise(index)}
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
                                                        onClick={() => onExerciseChange(index, "type", type as any)}
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
                                    onClick={onAddExercise}
                                    className="w-full py-2.5 border border-dashed border-white/20 rounded-xl text-slate-400 text-xs font-bold uppercase tracking-wider hover:bg-white/5 hover:text-white transition-colors mt-2"
                                >
                                    + Add Exercise
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={onSaveTemplate}
                            disabled={!templateForm.name}
                            className="mt-4 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Create Preset
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

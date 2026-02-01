export interface User {
    _id: string;
    email: string;
    name: string;
    picture?: string;
    messages?: Message[];
}

export interface Message {
    role: string;
    content: string;
}

export interface Event {
    id: string;
    title: string;
    start: string | Date; // API sends string, UI uses Date
    end: string | Date;
    allDay: boolean;
    color?: string;
    description?: string;
    seriesId?: string | null;
    recurrence?: 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
    recurrenceEnd?: string | Date | null;
    workoutLog?: WorkoutLogItem[];
    type?: 'task' | 'project' | 'expense' | 'workout';
    status?: 'pending' | 'in_progress' | 'completed' | 'blocked';
    priority?: 'low' | 'medium' | 'high';
}

export interface WorkoutLogItem {
    id?: string;
    name: string;
    type: 'count' | 'single' | 'tick' | 'text';
    sets?: string | number;
    reps?: string | number;
    value?: string | number;
    completed?: boolean;
    weight?: string | number;
    comment?: string;
}

export interface Note {
    id: string;
    notebook_id: string;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
}

export interface Template {
    id: string;
    name: string;
    exercises: WorkoutLogItem[];
}

export interface Notebook {
    id: string;
    name: string;
    created_at: string;
}

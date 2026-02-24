import { Event } from '../types';

// Generates recurring event instances for the current calendar view window only (lazy generation).
export const generateRecurringEvents = (baseEvent: Event, viewStart: Date, viewEnd: Date): Event[] => {
    if (!baseEvent.recurrence || baseEvent.recurrence === 'none') return [];

    const instances: Event[] = [];
    const recurrenceEnd = baseEvent.recurrenceEnd ? new Date(baseEvent.recurrenceEnd) : null;
    const eventStart = new Date(baseEvent.start);
    const duration = new Date(baseEvent.end).getTime() - eventStart.getTime();

    if (!viewStart || !viewEnd) return [];
    if (eventStart > viewEnd) return [];
    if (recurrenceEnd && recurrenceEnd < viewStart) return [];

    const MAX_VIEW_INSTANCES = 200;
    let i = 1; // Start at 1 to skip the base event itself (it is rendered separately)

    // Jump ahead for daily recurrence to avoid iterating from the beginning
    if (baseEvent.recurrence === 'daily' && eventStart < viewStart) {
        const daysDiff = Math.floor((viewStart.getTime() - eventStart.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff > 0) i = daysDiff;
    }

    while (instances.length <= MAX_VIEW_INSTANCES) {
        // Clone the original start and advance by exactly i intervals
        const next = new Date(eventStart);

        if (baseEvent.recurrence === 'daily') {
            next.setDate(next.getDate() + i);
        } else if (baseEvent.recurrence === 'weekly') {
            next.setDate(next.getDate() + i * 7);
        } else if (baseEvent.recurrence === 'biweekly') {
            next.setDate(next.getDate() + i * 14);
        } else if (baseEvent.recurrence === 'monthly') {
            next.setMonth(next.getMonth() + i);
        } else if (baseEvent.recurrence === 'yearly') {
            next.setFullYear(next.getFullYear() + i);
        }

        // Stop conditions
        if (recurrenceEnd && next > recurrenceEnd) break;
        if (next > viewEnd) break;

        if (next >= viewStart) {
            instances.push({
                ...baseEvent,
                id: `${baseEvent.id}_recur_${next.getTime()}`,
                start: new Date(next),
                end: new Date(next.getTime() + duration),
                isInstance: true,
            } as Event);
        }

        i++;
        if (i > 5000) break; // Absolute safety guard
    }

    return instances;
};

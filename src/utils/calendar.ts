import { Event } from '../types';

// Replace the problematic recurrence rules with optimized version
// FIX: Recurring Events Infinite Loop & ID ID Collision
// FIX: Lazy Loading Generator - Generates instances only for the current view
export const generateRecurringEvents = (baseEvent: Event, viewStart: Date, viewEnd: Date): Event[] => {
    // @ts-ignore - handle legacy data
    if (!baseEvent.recurrence || baseEvent.recurrence === 'none') return [];

    const instances: Event[] = [];
    const recurrenceEnd = baseEvent.recurrenceEnd ? new Date(baseEvent.recurrenceEnd) : null;
    const eventStart = new Date(baseEvent.start);

    // Safety check
    if (!viewStart || !viewEnd) return [];

    // Optimization: If event starts after view ends, skip
    if (eventStart > viewEnd) return [];

    // Optimization: If recurrence ends before view starts, skip
    if (recurrenceEnd && recurrenceEnd < viewStart) return [];

    let current = new Date(eventStart);
    let i = 0;

    // Iteration Limit per view (e.g. 100 days visible max)
    const MAX_VIEW_INSTANCES = 100;

    // Move current date to close to viewStart to avoid unnecessary iterations
    // This is a simple approximate jump, could be more precise but this handles most cases safely
    if (baseEvent.recurrence === 'daily' && current < viewStart) {
        const daysDiff = Math.floor((viewStart.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff > 0) {
            current.setDate(current.getDate() + daysDiff);
            i = daysDiff;
        }
    }

    while (true) {
        i++;
        // Calculate next date based on recurrence type
        if (baseEvent.recurrence === 'daily') {
            current.setDate(eventStart.getDate() + i);
        } else if (baseEvent.recurrence === 'weekly') {
            current.setDate(eventStart.getDate() + (i * 7));
        } else if (baseEvent.recurrence === 'biweekly') {
            current.setDate(eventStart.getDate() + (i * 14));
        } else if (baseEvent.recurrence === 'monthly') {
            current.setMonth(eventStart.getMonth() + i);
        } else if (baseEvent.recurrence === 'yearly') {
            current.setFullYear(eventStart.getFullYear() + i);
        }

        // STOP 1: Past recurrence end
        if (recurrenceEnd && current > recurrenceEnd) break;

        // STOP 2: Past view end (Optimization)
        if (current > viewEnd) break;

        // STOP 3: Safety limit
        if (instances.length > MAX_VIEW_INSTANCES) break;

        // Only add if within view (and after original start)
        if (current >= viewStart && current >= eventStart) {
            instances.push({
                ...baseEvent,
                id: `${baseEvent.id}_recur_${current.getTime()}`, // Unique ID for instance
                start: new Date(current),
                end: new Date(new Date(current).getTime() + (new Date(baseEvent.end).getTime() - new Date(baseEvent.start).getTime()))
            });
        }

        // Safety break for infinite loops in date calc
        if (i > 5000) break;
    }

    return instances;
};

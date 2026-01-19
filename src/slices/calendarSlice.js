import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    events: [],
};

const calendarSlice = createSlice({
    name: 'calendar',
    initialState,
    reducers: {
        setEvents: (state, action) => {
            state.events = action.payload;
        },
        addEvent: (state, action) => {
            state.events.push(action.payload);
        },
        updateEvent: (state, action) => {
            const index = state.events.findIndex(e => e.id === action.payload.id);
            if (index !== -1) {
                state.events[index] = action.payload;
            }
        },
        deleteEvent: (state, action) => {
            state.events = state.events.filter(e => e.id !== action.payload);
        },
        resetCalendar: (state) => {
            state.events = [];
        }
    }
});

export const { setEvents, addEvent, updateEvent, deleteEvent, resetCalendar } = calendarSlice.actions;

export const selectEvents = (state) => state.calendar.events;

export default calendarSlice.reducer;

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store/store';
import { Event, Note, Notebook, User } from '../types';



// Helper for Auth header
const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_SERVER_URL || 'http://localhost:8000',
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth?.token || localStorage.getItem('token');
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
            // console.log("DEBUG: apiSlice attached token:", token.substring(0, 10) + "...");
        } else {
            console.warn("DEBUG: apiSlice found no token!");
        }
        return headers;
    },
});

export const api = createApi({
    reducerPath: 'api',
    baseQuery,
    tagTypes: ['User', 'Events', 'Notes', 'Notebooks'],
    endpoints: (builder) => ({
        // --- Auth ---
        getUser: builder.query<User, void>({
            query: () => '/me',
            providesTags: ['User'],
        }),
        userAuth: builder.mutation<{ token: string; user: User }, { token: string }>({
            query: (body) => ({
                url: '/userauth/',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['User', 'Events', 'Notes', 'Notebooks'],
        }),
        signout: builder.mutation<void, void>({
            query: () => ({
                url: '/signout/',
                method: 'POST',
            }),
            invalidatesTags: ['User'],
        }),

        // --- Chat / Docs ---
        uploadDocument: builder.mutation<void, FormData>({
            query: (formData) => ({
                url: '/upload/',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['User'],
        }),
        removeDocument: builder.mutation<void, void>({
            query: () => ({
                url: '/removefile/',
                method: 'POST',
            }),
            invalidatesTags: ['User'],
        }),
        sendMessage: builder.mutation<{ answer: string; matched_chunks: number; document_used: string | null }, { question: string }>({
            query: (body) => ({
                url: '/query/',
                method: 'POST',
                body,
            }),
        }),

        // --- Notebooks ---
        getNotebooks: builder.query<Notebook[], void>({
            query: () => '/notebooks',
            providesTags: ['Notebooks'],
        }),
        createNotebook: builder.mutation<Notebook, { name: string }>({
            query: (body) => ({
                url: '/notebooks',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Notebooks'],
        }),
        updateNotebook: builder.mutation<void, { id: string; name: string }>({
            query: ({ id, name }) => ({
                url: `/notebooks/${id}`,
                method: 'PUT',
                body: { name },
            }),
            invalidatesTags: ['Notebooks'],
        }),
        deleteNotebook: builder.mutation<void, string>({
            query: (id) => ({
                url: `/notebooks/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Notebooks', 'Notes'],
        }),

        // --- Notes ---
        getNotes: builder.query<Note[], string>({
            query: (notebookId) => `/notebooks/${notebookId}/notes`,
            providesTags: ['Notes'],
        }),
        createNote: builder.mutation<Note, { notebookId: string; title: string; content: string }>({
            query: ({ notebookId, title, content }) => ({
                url: `/notebooks/${notebookId}/notes`,
                method: 'POST',
                body: { title, content },
            }),
            invalidatesTags: ['Notes'],
        }),
        updateNote: builder.mutation<void, { id: string; title: string; content: string }>({
            query: ({ id, title, content }) => ({
                url: `/notes/${id}`,
                method: 'PUT',
                body: { title, content },
            }),
            invalidatesTags: ['Notes'],
        }),
        deleteNote: builder.mutation<void, string>({
            query: (id) => ({
                url: `/notes/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Notes'],
        }),

        // --- Events ---
        getEvents: builder.query<Event[], void>({
            query: () => '/events',
            providesTags: ['Events'],
            // Transform ISO strings to Date objects just in case, but usually handled in Component
        }),
        createEvent: builder.mutation<Event, Partial<Event>>({
            query: (body) => ({
                url: '/events',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Events'],
        }),
        updateEvent: builder.mutation<void, Partial<Event>>({
            query: (event) => ({
                url: `/events/${event.id}`,
                method: 'PUT',
                body: event,
            }),
            invalidatesTags: ['Events'],
        }),
        deleteEvent: builder.mutation<void, string>({
            query: (id) => ({
                url: `/events/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Events'],
        }),
        deleteAllEvents: builder.mutation<void, void>({
            query: () => ({
                url: '/events/all',
                method: 'DELETE',
            }),
            invalidatesTags: ['Events'],
        }),
    }),
});

export const {
    useGetUserQuery,
    useUserAuthMutation,
    useSignoutMutation,
    useUploadDocumentMutation,
    useRemoveDocumentMutation,
    useSendMessageMutation,
    useGetNotebooksQuery,
    useCreateNotebookMutation,
    useUpdateNotebookMutation,
    useDeleteNotebookMutation,
    useGetNotesQuery,
    useCreateNoteMutation,
    useUpdateNoteMutation,
    useDeleteNoteMutation,
    useGetEventsQuery,
    useCreateEventMutation,
    useUpdateEventMutation,
    useDeleteEventMutation,
    useDeleteAllEventsMutation,
} = api;

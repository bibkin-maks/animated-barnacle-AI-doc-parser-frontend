/// <reference types="vite/client" />
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


export const api = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_SERVER_URL,

    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  endpoints: (builder) => ({
    getUser: builder.query({
      query: () => `/me`,
    }),

    sendMessage: builder.mutation({
      query: (message) => ({
        url: "/query",
        method: "POST",
        body: message,
      }),
    }),

    uploadFile: builder.mutation({
      query: (file) => ({
        url: "/upload",
        method: "POST",
        body: file,
      }),
    }),

    removeFile: builder.mutation({
      query: () => ({
        url: "/removefile",
        method: "POST"
      })
    })
    ,


    authUser: builder.mutation({
      query: (credentialID) => ({
        url: "/userauth/",
        method: "POST",
        body: { token: credentialID },
      }),
    }),

    signoutUser: builder.mutation({
      query: () => ({
        url: "/signout",
        method: "POST",
        body: {}
      })
    }),

    // Notebooks
    getNotebooks: builder.query({
      query: () => "/notebooks",
      providesTags: ["Notebooks"],
    }),

    createNotebook: builder.mutation({
      query: (body) => ({
        url: "/notebooks",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notebooks"],
    }),

    updateNotebook: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/notebooks/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Notebooks"],
    }),

    deleteNotebook: builder.mutation({
      query: (id) => ({
        url: `/notebooks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notebooks"],
    }),

    // Notes
    getNotes: builder.query({
      query: (notebookId) => `/notebooks/${notebookId}/notes`,
      providesTags: ["Notes"],
    }),

    createNote: builder.mutation({
      query: ({ notebookId, ...body }) => ({
        url: `/notebooks/${notebookId}/notes`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notes"],
    }),

    updateNote: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/notes/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Notes"],
    }),

    deleteNote: builder.mutation({
      query: (id) => ({
        url: `/notes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notes"],
    }),
  }),
  tagTypes: ["Notebooks", "Notes"],
});



export const {
  useGetUserQuery,
  useSendMessageMutation,
  useSignoutUserMutation,
  useUploadFileMutation,
  useRemoveFileMutation,
  useAuthUserMutation,
  useGetNotebooksQuery,
  useCreateNotebookMutation,
  useUpdateNotebookMutation,
  useDeleteNotebookMutation,
  useGetNotesQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,

} = api;

